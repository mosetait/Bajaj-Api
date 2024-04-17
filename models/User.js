const mongoose = require("mongoose");
const crypto = require("crypto")

const userSchema = new mongoose.Schema({


    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    name : {
        type: String,
        required: true
    },


    role: {
        type: String,
        enum: ["subAdmin" , "admin"],
        default: "admin"
    },


    token: {
        type: String,
    },

    resetPasswordToken : String,
    resetPasswordExpire : Date,




} , {timestamps:true})






// Generating password reset token
userSchema.methods.getResetToken = function () {

    // Generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetPasswordToken to user schema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}



module.exports = mongoose.model?.User || mongoose.model("User" , userSchema);