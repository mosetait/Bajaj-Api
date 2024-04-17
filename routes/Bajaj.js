const express = require("express");
const { getProdcuctInfo } = require("../controllers/Product");
const { isBajaj } = require("../middleware/auth");
const router = express.Router();


router.route("/get-product-information").post( isBajaj , getProdcuctInfo);



module.exports = router