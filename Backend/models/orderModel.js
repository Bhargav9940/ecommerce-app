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
        state: {
            type: String,
            required: [true, "state is required"]
        },
        country: {
            type: String,
            required: [true, "country is required"]
        },
        postalCode: {
            type: String,
        },
        phone: {
            type: String,
            required: [true, "phone number is required"]
        }
    },
    orderItems: [
        {
            name: {
                type: String,
                required: [true, "item name is required"]
            },
            price: {
                type: String,
                required: [true, "item price is required"]
            },
            image: {
                type: String,
                required: [true, "item image is required"]
            },
            quantity: {
                type: Number,
                rquired: [true, "item quantity is required"]
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products",
                required: [true, "product is required"]
            }
        }
    ],
    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        default: "ONLINE"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: [true, "user is required"]
    },
    paidAt: Date,
    paymentInfo: {
        id: String,
        method: String,
        status: {
            type: String,
            enum: ["pending", "success", "failed", "refunded"],
            default: "pending"
        },
        amount: Number,
        currency: String,
        provider: String
    },
    refundInfo: {
        id: String,
        status: {
            type: String,
            enum: ["pending", "success", "failed"]
        },
        amount: Number,
        currency: String,
        refundedAt: Date
    },
    totalPrice: {
        type: Number,
        required: [true, "totalprice is required"]
    },
    tax: {
        type: Number,
        default: 0
    },
    shippingCharges: {
        type: Number,
        default: 0
    },
    orderTotal: {
        type: String,
        required: [true, "orderTotal is required"]
    },
    orderStatus: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled", "failed"],
        default: "pending"
    },
    deliveredAt: Date,
    cancelledAt: Date
}, {timestamps: true});


const Order = mongoose.model("Orders", orderSchema);
module.exports = Order;
