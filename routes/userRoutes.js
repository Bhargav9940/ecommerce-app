const express = require("express");
const router = express.Router();
const { registerController,
    loginController,
    getUserProfileController,
    logoutController,
    updateProfileController, 
    updatePasswordController, 
    updateProfilePicController,
    resetPwdEmailController,
    verifyOTPsetPwdController } = require("../controllers/userController");

const {isAuth} = require("../middlewares/isAuthenticated");
const singleUpload = require("../middlewares/multer");
const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

//register
router.post("/register", limiter, registerController);

//login
router.post("/login", limiter, loginController);

//profile
router.get("/profile", isAuth, getUserProfileController);

//logout
router.get("/logout", isAuth, logoutController);

//update-profile
router.put("/update-profile", isAuth, updateProfileController);

//update-password
router.put("/update-password", isAuth, updatePasswordController);

//update-profile-pic
router.put("/update-profile-pic", isAuth, singleUpload, updateProfilePicController);


//reset password
router.post("/reset-password/email", resetPwdEmailController);

//cerify otp and set password
router.post("/reset-password/verify", verifyOTPsetPwdController);

////////////////User management by admin 
//Marked for review ---- unfinished work




module.exports = router;
