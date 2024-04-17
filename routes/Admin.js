const express = require("express");
const { isAuth, isAdmin } = require("../middleware/auth");
const { sendOtp, signUp, login, logout, changePassword, forgetPassword, resetPassword } = require("../controllers/Auth");
const { addProductsToStockist, deleteProductsFromStockist, updateProduct, createStockist, updateStockist, deleteStockist } = require("../controllers/Admin");
const router = express.Router();



router.route("/send-otp").post(sendOtp);
router.route("/register-new-handler").post(signUp);
router.route("/login-existing-handler").post(login);
router.route("/logout-existing-handler").post( isAuth , logout);
router.route("/change-password").put(isAuth , changePassword);
router.route("/forget-password").post(forgetPassword);
router.route("/reset-password/:token").put(resetPassword);

router.route("/create-stockist").post(isAuth , isAdmin , createStockist);
router.route("/update-stockist").put(isAuth , isAdmin , updateStockist);
router.route("/delete-stockist").delete(isAuth , isAdmin , deleteStockist);

router.route("/add-products-to-stockist").post(isAuth, isAdmin, addProductsToStockist);
router.route("/delete-products-from-stockist").delete(isAuth , isAdmin , deleteProductsFromStockist);
router.route("/update-product").put(isAuth, isAdmin, updateProduct);




module.exports = router