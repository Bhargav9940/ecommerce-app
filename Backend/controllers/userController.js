const userModel = require("../models/userModel");
const { getDataUri } = require("../utils/features");
const cloudinary = require("cloudinary");
const { sendOTPEmail } = require("../services/sendEmail");

const isLoggendIn = async(req, res) => {
    if(!req.user) {
        return res.status(401).send({
            success: false,
            message: "Unverified"
        });
    }
    else {
        const user = req.user;
        user.password = undefined;
        return res.status(200).send({
            success: true,
            message: "Verified",
            user: user
        });
    }
}

const registerController = async (req, res) => {
    try {
        const { name, email, password, address, city, country, phone } = req.body;
        if (!name || !email || !password || !address || !city || !country || !phone) {
            return res.status(400).send({
                success: false,
                message: "All fields are mandatory"
            });
        }
        if(password.length <= 6) {
            return res.status(400).send({
                success:false,
                message: "Password must be greater than 6 characters."
            });
        }
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).send({
                success: false,
                message: "email already exists"
            });
        }
        const user = await userModel.create({
            name,
            email,
            password,
            address,
            city,
            country,
            phone
        });
        res.status(201).send({
            success: true,
            message: "Registration success, please login!",
            user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in register API",
            error
        });
    }
};

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        //email or password is provided or not
        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: "Email or Password is required"
            });
        }

        //validation of user's existance
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "user not found"
            });
        }

        //Checking password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).send({
                success: false,
                message: "invalid credentials"
            });
        }

        //Creating token
        const token = user.generateToken();
        res.status(200).cookie("token", token, {
            expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            secure: process.env.NODE_ENV === "development" ? true : false,
            httpOnly: process.env.NODE_ENV === "development" ? true : false,
            sameSite: process.env.NODE_ENV === "developement" ? true : false

        //Marked for review
        // expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Expires in 15 days
        // secure: process.env.NODE_ENV !== "development",           // Secure inproduction
        // httpOnly: true,                                  // Always HttpOnlyfor security
        // sameSite: process.env.NODE_ENV === "development" ? "Lax" : "Strict" // Lax in dev, Strict in production

        }).send({
            success: true,
            message: "login successfully",
            token,
            user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Login API",
            error
        })
    }
}

//get profile
const getUserProfileController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        user.password = undefined;
        res.status(200).send({
            success: true,
            message: "User profile fetched successfully",
            user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Profile API",
            error
        })
    }
}

const logoutController = (req, res) => {
    try {
        res.clearCookie("token").status(200).send({
            success: true,
            message: "log out succesful"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in log out API"
        });
    }
}

const updateProfileController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        const { name, shippingInfo } = req.body;

        if(!name || !shippingInfo) {
            return res.status(400).send({
                success: false,
                message: "name and shippingInfo required"
            });
        }

        if (name) user.name = name;
        if (shippingInfo?.address) user.shippingInfo.address = shippingInfo.address;
        if (shippingInfo?.city) user.shippingInfo.city = shippingInfo.city;
        if (shippingInfo?.state) user.shippingInfo.state = shippingInfo.state;
        if (shippingInfo?.country) user.shippingInfo.country = shippingInfo.country;

        if(shippingInfo?.postalCode?.length != 6 || isNaN(Number(shippingInfo?.postalCode))) {
            return res.status(400).send({
                success: false,
                message: "Invalid Postal Code"
            });
        }
        if (shippingInfo?.postalCode) user.shippingInfo.postalCode = shippingInfo.postalCode;

        await user.save();
        res.status(200).send({
            success: true,
            message: "profile updated successfully"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in update-profile API"
        });
    }
};

const updatePasswordController = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).send({
                success: false,
                message: "Both passwords are required"
            });
        }

        const user = await userModel.findById(req.user._id);

        const isMatched = await user.comparePassword(oldPassword);
        if (!isMatched) {
            return res.status(401).send({
                success: false,
                message: "Old Password is wrong"
            });
        }

        user.password = newPassword;
        user.save();
        res.status(200).send({
            success: true,
            message: "Password updated successfully"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in update-password API"
        });
    }

}

//update profile pic
const updateProfilePicController = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);

        //getting DataURI string of file
        const file = getDataUri(req.file);

        await cloudinary.v2.uploader.destroy(user.profilePic.public_id);

        const cdb = await cloudinary.v2.uploader.upload(file.content);

        user.profilePic = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        };

        await user.save();

        res.status(200).send({
            success: true,
            message: "Profile pic updated successfully"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in update profile API"
        });
    }
};

//reset password
// verify email and otp generation
const resetPwdEmailController = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({email});
        if(!user) {
            return res.status(404).send({
                success: false,
                message: "user not found"
            });
        }
        let otp = "";
        for(let i=0; i<6; i++)
            otp = otp + (Math.floor(Math.random() * 10)).toString();
        user.otp = otp;

        //send otp to user
        sendOTPEmail(otp, email);

        await user.save();
        res.status(200).send({
            success: true,
            message: "OTP generated and email sent successfully",
            email
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in reset password verify email API"
        });
    }
}

//verify otp and set new password 
const verifyOTPsetPwdController = async (req, res) => {
    try {
        const { email, OTP, newPassword } = req.body;
        if(!OTP) {
            return res.status(400).send({
                success: false,
                message: "OTP is required"
            });
        }
        const user = await userModel.findOne({email});
        if(!user) {
            return res.status(404).send({
                success: false,
                message: "user not found"
            });
        }
        if(!user.otp) {
            return res.status(401).send({
                success: false,
                message: "generate otp to change password"
            });
        }
        if(OTP !== user.otp) {
            return res.status(401).send({
                success: false,
                message: "Wrong OTP"
            });
        }
        //make user.otp undefined
        user.otp = undefined;
        user.password = newPassword;
        await user.save();
        res.status(200).send({
            success: true,
            message: "OTP verified and password set successfully",
            email
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in verify OTP and set password API"
        });
    }
}

module.exports = {
    registerController,
    loginController,
    getUserProfileController,
    logoutController,
    updateProfileController,
    updatePasswordController,
    updateProfilePicController,
    resetPwdEmailController,
    verifyOTPsetPwdController,
    isLoggendIn
}