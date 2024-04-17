const crypto = require("crypto");
const secretKey = process.env.ACCESS_KEY;
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.isBajaj = async (req, res, next) => {

    try {

        // check request must be POST(-6)
        if(req.method !== "POST"){
            return res.status(405).json({
                responseStatus: "-6",
                responseMessage: "Only Post Method Allowed"
            })
        }

        // Check authorization key
        const { accessKey } = req.body;

        if(!accessKey) {
            return res.status(404).json({
                responseStatus: "-5",
                responseMessage: "authorization key not found",
            });
        }


        // Convert accessKey and secretKey to buffers
        const accessKeyBuffer = Buffer.from(accessKey);
        const secretKeyBuffer = Buffer.from(secretKey);

        // Use constant time comparison
        const isAuth = crypto.timingSafeEqual(accessKeyBuffer, secretKeyBuffer);

        if (!isAuth) {
            console.error(`Unauthorized access attempt from IP ${req.ip}`);
            return res.status(403).json({
                responseStatus: "403",
                responseMessage: `Authorization key mismatch`,
            });
        }

        // Continue with the next middleware or route handler
        next();

    } 
    catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({
            responseStatus: "500",
            responseMessage: `Internal Server Error : ${error}`,
        });
    }
};



// is user logged in 
exports.isAuth = async (req , res , next) => {

    try {

        const {token} = req.cookies;

        if(!token) {
            return res.status(401).json({
                message: "Please Login First",
                success: false
            })
        }

          

        // Verifying Token
        try {
            
            const decode = jwt.verify(token , process.env.JWT_SECRET);

            req.user = decode;

        } catch (error) {
            console.log(error)
            return res.status(401).json({ 
                success: false, 
                message: "token is invalid" 
            });

        }

        // If JWT is valid, move on to the next middleware or request handler
		next();

    } 
    catch (error) {
        console.log(error);
        return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
    }

}



// isAdmin
exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.role !== "admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}

		next();

	} catch (error) {
        console.log(error)
		return res.status(500).json({ 
            success: false, 
            message: `User Role Can't be Verified` 
        });
	}
};