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


//register
router.post("/register", registerController);

//login
router.post("/login", loginController);

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
