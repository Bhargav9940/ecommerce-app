const JWT = require("jsonwebtoken");
const userModel = require("../models/userModel");
const isAuth = async (req, res, next) => {
    try {
        const {token} = req.cookies;
        if(!token) {
            return res.status(401).send({
                success: false,
                message: "Unauthorized User"
            });
        }

        //Marked for review - everytime querying db may cost more
        const decodedToken = JWT.verify(token, process.env.JWT_SECRET);
        req.user = await userModel.findById(decodedToken);


        // Marked for review - enable it or not
        // only executes if token is valid but user does not exist in db
        // if(!req.user) {
        //     return res.status(401).send({
        //         success: false,
        //         message: "user not found"
        //     });
        // }

        next();
    }
    catch(error) {
        console.log(error);
        res.status(401).send({
            success: false,
            message: "invalid or expired token"
        });
    }
};

//admin role check
const isAdmin = (req, res, next) => {
    if(req.user.role !== "admin") {
        return res.status(401).send({
            success: false,
            message: "only admin is allowed"
        });
    }
    next();
};

module.exports = {
    isAuth,
    isAdmin
}