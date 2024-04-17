const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require('validator');
const crypto = require("crypto");
const mailSender = require("../utils/mailSender")

require("dotenv").config();


const generateOtp = () => {
    return Math.floor(1000 +  Math.random() * 9000);
}



// Send OTP
exports.sendOtp = async (req , res) => {

    try {

        const {email} = req.body;

        if(!email){
          return res.status(401).json({
            success: false,
            message: "Please provide email"
          })
        }

        // check if user already exist or not
        const existingUser = await User.findOne({email});

        const prevOtp = await OTP.findOne({email});

        if(existingUser){
            return res.status(401).json({
                message: "User already exist",
                success: false
            })
        }

        if(prevOtp){
            await OTP.findOneAndDelete({email});
        }

        const otp = generateOtp();

        const createOtp = await OTP.create({email , otp});

        return res.status(200).json({
            message: "OTP sent successfully",
            success: true
        })

    } 
    catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Failed to send OTP",
            success: false
        })
    }

}


// SignUp
exports.signUp = async (req , res) => {
    
    try {
      
        // Destructure fields from the request body
        const {
            email,
            password,
            name,
            otp,
        } = req.body;

        // Check if All Details are there or not
        if (
          !email ||
          !password ||
          !name ||
          !otp 
        ) {
            return res.status(403).send({
            success: false,
            message: "All Fields are required",
            })
        }



        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            })
        }


        // Verifying OTP
        const response = await OTP.findOne({ email });
 
        if(!response){
            return res.status(401).json({
                message: "OTP Not Found or OTP Expired",
                success: false
            })
        }

        console.log(response);
        console.log(otp);

        if(response.otp !== otp){
            return res.status(401).json({
                message: "Invalid OTP",
                success: false
            })
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password , 10);


        const user = await User.create({
            email,
            name,
            password: hashedPassword
        });

        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
        })
        

    }

    catch (error) {

        console.error(error)
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        })
    }

}


// Login
exports.login = async (req, res) => {

    try {

      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(401).json({
          message: 'Please provide a valid Email and Password',
          success: false,
        });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({
          message: 'Invalid Email or Password',
          success: false,
        });
      }
  
      if (await bcrypt.compare(password, user.password)) {

        const token = jwt.sign(
          {
            email: user.email,
            id: user._id,
            role: user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '72h',
          }
        );
  
        user.token = token;
        user.password = undefined;
  
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: 'None', // Adjust based on your application's needs
          secure: true, // Set to true in production if served over HTTPS
        };
  
        res.cookie('token', token, options).status(200).json({
          message: 'Logged in successfully',
          success: true,
          user,
        });

      } 
      else {
        return res.status(401).json({
          success: false,
          message: 'Invalid Email or Password',
        });
      }
    } 
    catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Login failure, please try again',
      });
    }
};



// Logout
exports.logout = async (req, res) => {

  try {

    let { token } = req.cookies;

    if (token !== "") {
      // Clear the 'token' cookie
      res.clearCookie('token');

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } 
    else {
      return res.status(200).json({
        success: false,
        message: 'You are already logged out.',
      });
    }
  } 
  catch (error) {
    console.log(error);
    return res.status(401).json({
      message: 'Error while logging out',
      success: false,
    });
  }
};



// Change Password
exports.changePassword = async (req,res) => {

  try {

      const {oldPassword , newPassword} = req.body;

      const user = await User.findOne({email : req.user.email}).select("+password");

      // validate old password
      const isPasswordMatched = await bcrypt.compare(oldPassword , user.password);

      if(!isPasswordMatched){
          return res.status(401).json({
              message: "Your old password is incorrect",
              success: false
          })
      }

      // update password
      const hashedPassword = await bcrypt.hash(newPassword , 10);
      const updateUser = await User.findByIdAndUpdate(req.user.id , {password: hashedPassword} , {new: true});
    

      return res.status(200).json({ 
          success: true, 
          message: "Password updated successfully" 
      })

  } 
  catch (error) {
      
     console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })

  }

}


// Forgot password
exports.forgetPassword = async (req,res,next) => {

  const {email} = req.body;

  if(!email){
    return res.status(401).json({
      success: false,
      message: "Please enter your email."
    })
  }

  const user = await User.findOne({email}).select("+password");

  if(!user){
      return res.status(404).json({
          message: "User not found",
          success: false
      })
  }

  
  try{
  
      // Get ResetPassword Token
      const resetToken = user.getResetToken();
  
      await user.save({validateBeforeSave:false});
  
      const resetPasswordUrl = `http://localhost:3000/auth/reset-password/${resetToken}`

   
      await mailSender(
        user.email,
        "Password Update",
        `<p>Hello ${user.name},</p>
        <p>Your reset password link is here. 
        Click <a href="${resetPasswordUrl}">here</a> to reset your password.</p>`
    );
    
        

      res.status(200).json({
          success: true,
          message: `Email sent to ${user.email} successfully`,
      })

  }catch(error){
      console.log(error)
      user.resetPasswordToken = undefined;
      user.resetPasswordToken = undefined;
      await user.save({validateBeforeSave:false});

      return res.status(500).json({
          message: "Error while forgetting password",
          success: false,
      });
  }
}



// Reset Password
exports.resetPassword = async (req,res,next) => {

  try {

      const {password , confirmPassword} = req.body;

      if(!password || !confirmPassword){
        return res.status(401).json({
          success: false,
          message: "Please fill all the fields."
        })
      }

      const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");



      const user = await User.findOne({
          resetPasswordToken,
          resetPasswordExpire : { $gt : Date.now() },
      }).select("+password");

      if(!user){
          return res.status(400).json({
              message: "Reset password token is invalid or has been expired",
              success: false
          })
      }


      if(password !== confirmPassword){
          return res.status(400).json({
              message: "Password does not match",
              success: false
          })
      }


      const hashedPassword = await bcrypt.hash(req.body.password , 10);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return res.status(200).json({
          message : "Password reset successfully",
          success: true
      });

  } catch (error) {

      console.log(error);
      return res.status(500).json({
          message: "Error while Resetting password",
          success: false,
      });
      
  }

}




// Get user info to make him logged in on every page
exports.getUserInfo = async (req, res) => {

  try {

    const { id } = req.user; // Assuming the user ID is stored in the token payload

    if(!id){
      return res.status(401).json({
        success: false,
        message: "Please login."
      })
    }

    const user = await User.findById(id).select('-password'); // Exclude password from the response

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  }
   catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error getting user information',
    });
  }
};