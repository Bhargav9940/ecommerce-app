const mongoose = require("mongoose");

//review schema
const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    rating: {
        type: Number,
        default: 0
    },
    comment: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: [true, "user required"]
    }
}, {timestamps: true});

//product schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
    },
    stock: {
        type: Number,
        required: [true, "Product stock is required"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    images: [
        {
            public_id: String,
            url: String
        }
    ],
    reviews: [reviewSchema],
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

const productModel = mongoose.model("Products", productSchema);

module.exports = productModel