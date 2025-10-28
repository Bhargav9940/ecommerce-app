const orderModel = require("../models/orderModel");
const { client:getClient } = require("../services/paypalClient");

const paypal = require("@paypal/checkout-server-sdk");

const client = getClient();
const createPayPalOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);

        if(!order) {
            return res.status(404).send({
                success: false,
                message: "Order not found"
            })
        }

        if(order.paymentInfo.status == "success") {
            return res.status(400).send({
                success: false,
                message: "Payment already succeeded"
            })
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: order.orderTotal.toString()
                    },
                },
            ],
        });

        const response = await client.execute(request);
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            {
                $set: {
                    "paymentInfo.id": response.result.id,
                    "paymentInfo.amount": order.orderTotal,
                    "paymentInfo.currency": "USD",
                    "paymentInfo.provider": "paypal"
                }

            },
            { new:true }
        );
        //paypalOrderId
        return res.json({ id: response.result.id });
    }
    catch(error) {
        console.error("Error creating paypal order: ", error.response?.data || error.message);
        return res.status(500).send({
            success: false,
            message: "Error creating paypal order",
            error: error.response?.data || error.message,
        });
    }
};

// Capture Paypal order
const capturePayPalOrder = async(req, res) => {
    try {
        const { paypalOrderId } = req.params;
        const { orderId } = req.body;
        
        if(!paypalOrderId || !orderId) {
            return res.status(400).send({
                success: false,
                message: "paypalOrderId and orderId are required"
            });
        }
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});

        const capture = await client.execute(request);

        if(capture.result.status === "COMPLETED") {
            const updatedOrder = await orderModel.findByIdAndUpdate(
                orderId,
                {
                    $set: {
                        "paymentInfo.status": "success",
                        "paidAt": new Date(),
                        "orderStatus": "processing"
                    }
                },
                {new: true}
            );

            return res.json({
                success: true,
                order: updatedOrder
            });
        } 

        res.status(400).send({
            success: false,
            message: "Payment not completed"
        });
    }
    catch(error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "Payment capture failed"
        });
    }
};

module.exports = { createPayPalOrder, capturePayPalOrder };