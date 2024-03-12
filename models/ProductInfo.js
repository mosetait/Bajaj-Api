const mongoose = require("mongoose");

const productInfoSchema = new mongoose.Schema({

    serialNumber: {
        type: String,
        required: true,
        unique: true
    },

    materialCode: {
        type: String,
        required: true,
    },
    
    dealerCode: {
        type: String,
        required: true,
    },
    
    dealerId: {
        type: String,
        required: true,
    },

    itemType:{
        type: String,
        required: true,
        default: ""
    },

    dateOfManufacture: {
        type: Date,
        // required: true
    },

    assignedTo:{
        type: String,
        required: true,
        default: ""
    },

    itemModel: {
        type: String,
        required: true,
        default: ""
    },

    isSold:{
        type: Boolean,
        required: true,
    }

});



module.exports = mongoose.model("ProductInfo", productInfoSchema);
