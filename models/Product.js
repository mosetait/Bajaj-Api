const mongoose = require("mongoose");

const productInfoSchema = new mongoose.Schema({

    serialNumber: {
        type: String,
        required: [true , "Please enter serial number"],
        unique: true
    },

    materialCode: {
        type: String,
        required: [true , "Please enter material code"],
    },
    

    itemType:{
        type: String,
        required: [true , "Please enter item type"],
        default: ""
    },

    dateOfManufacture: {
        type: Date,
        // required: true
    },

    stockist:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stockist",
        required: true,
    },

    itemModel: {
        type: String,
        required: [true , "Please enter item model"],
        default: ""
    },

    isValidated:{
        type: Boolean,
        required: true,
        default: false
    }

});



module.exports = mongoose.model("Product", productInfoSchema);
