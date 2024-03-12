const express = require("express");
const { getProdcuctInfo } = require("../controllers/ProductInfo");
const { auth } = require("../middleware/auth");
const router = express.Router();


router.route("/get-product-information").post( auth , getProdcuctInfo);



module.exports = router