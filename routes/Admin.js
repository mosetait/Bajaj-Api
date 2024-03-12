const express = require("express");
const { createProdcuctInfo, updateProdcuctInfo, deleteProdcuctInfo } = require("../controllers/Admin");
const { auth } = require("../middleware/auth");
const router = express.Router();


router.route("/create-product-information").post(createProdcuctInfo);
router.route("/update-product-information").put(updateProdcuctInfo);
router.route("/delete-product-information").delete(deleteProdcuctInfo);



module.exports = router