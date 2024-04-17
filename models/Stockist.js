const mongoose = require("mongoose");
const validator = require("validator");

const stockistSchema = new mongoose.Schema({

    name : {
        type: String,
        required: true
    },

    tradeName: {
        type: String,
        required: [true , "Please enter you name.\n"]
    },

    gstNo :{
        type: String,
        required: [true , "Please enter your GST number.\n"]
    },

    principalPlaceOfBusiness : {
        type: String,
        required: [true , "Please enter your principal place of business address.\n"]
    },

    address: {
        type: String,
    },

    state: {
        type: String,
        required: [true , "Please select an state.\n"]
    },

    districts:{
        type: [String]
    },

    email:{
        type: String,
        validate: [validator.isEmail , "Please enter a valid Email.\n"]
    },

    contactNo : {
        type: Number,
    },



    dealerCode: {
        type: String,
        required: [true , "Please enter dealer code.\n"]
    },

    products: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Products"
    }

})

module.exports = mongoose.model("Stockist", stockistSchema);
