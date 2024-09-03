const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: [true, "address is required"]
        },
        city: {
            type: String,
            required: [true, "city is required"]
        },
        country: {
            type: String,
            required: [true, "country is required"]
        }
    },
    orderItems: [
        {
            name: {
                type: String,
                required: [true, "product name is required"]
            },
            price: {
                type: Number,
                required: [true, "product price is required"]
            },
            quantity: {
                type: Number,
                required: [true, "product quantity is required"]
            },
            image: {
                type: String,
                required: [true, "product image is required"]
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products",
                required: true
            }
        }
    ],
    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        default: "COD"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    paidAt:Date,
    paymentInfo: {
        type: String,
        status: String
    },
    itemPrice: {
        type: Number,
        required: [true, "item price is required"]
    },
    tax: {
        type: Number,
        required: [true, "tax price is required"]
    },
    shippingCharges: {
        type: Number,
        required: [true, "shipping charges is required"]
    },
    totalAmount: {
        type: Number,
        required: [true, "total amount is required"]
    },
    orderStatus: {
        type: String,
        enum: ["processing", "shipped", "delivered"],
        default: "processing"
    },
    deliveredAt: Date,
}, {timestamps: true});


const orderModel = mongoose.model("Orders", orderSchema);

module.exports = orderModel;