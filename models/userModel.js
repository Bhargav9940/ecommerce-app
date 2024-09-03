const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "email is already taken"]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minLength: [6, "password length should be greater than 6 characters"]
    },
    address: {
        type: String,
        required: [true, "address is required"]
    },
    city: {
        type: String,
        required: [true, "country is required"]
    },
    country: {
        type: String,
        required: [true, "country is required"]
    },
    phone: {
        type: String,
        required: [true, "phone is required"]
    },
    profilePic: {
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    otp: {
        type: String,
    }
}, {timestamps: true});


// hash function - to hash a password
//will be executed when password entered at signup/registeration time
// the number 10 actually represents the cost factor (or the number of salt rounds) for bcrypt, not the length of the salt. The cost factor determines how much time it will take to hash the password. A higher cost factor means more computation is required, making it harder to brute-force the hash.
userSchema.pre("save", async function(next) {
    //if password is not modified - case where user updates profile but not the password
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);   //Number or String /
});

//functions over schema - these functions are associated with every object of db
//comaparePassword function to compare passwords
userSchema.methods.comparePassword = async function(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};


//JWT Token
userSchema.methods.generateToken = function() {
    return JWT.sign({_id: this._id}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};


const User = mongoose.model("Users", userSchema);

module.exports = User;