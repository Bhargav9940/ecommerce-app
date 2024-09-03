const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");

const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;
    //validation
    if(!shippingInfo || !orderItems || !paymentInfo || !itemPrice || !shippingCharges || !totalAmount || !tax) {
        return res.status(400).send({
            success: false,
            message: "All fields are mandatory"
        });
    }
    await orderModel.create({
        user: req.user._id,
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        tax,
        shippingCharges,
        totalAmount
    });

    //update stock
    for(let i=0; i<orderItems.length; i++) {
        const product = await productModel.findById(orderItems[i].product);
        product.stock = product.stock - orderItems[i].quantity;
        await product.save();
    }
    res.status(201).send({
        success: true,
        message: "Order is placed successfully."
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create order API",
      error,
    });
  }
};

//get my all orders
const getMyOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({user: req.user._id});
        if(!orders) {
            return res.status(404).send({
                success: false,
                message: "No orders found"
            });
        }
        res.status(200).send({
            success: true,
            message: "Orders fetched successfully",
            totalOrders: orders.length,
            orders
        });
    } catch(error) {
        console.log(error);
        res.status(500).send({
        success: false,
         message: "Error in get my orders API",
        error,
     });
    }
};

//get single order
const getSingleOrderController = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);
        if(!order) {
            return res.status(404).send({
                success: fales,
                message: "Order not found"
            });
        }
        res.status(200).send({
            success: true,
            message: "order fetched successfully",
            order
        });
    }
    catch(error) {
        console.log(error);
        if(error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: "Invalid id at single order fetch",
            });
        }
        res.status(500).send({
        success: false,
        message: "Error in get my single order API",
        error,
     });
    }
};

/////////////Admin 

//get all order admin
const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.status(200).send({
            success: true,
            message: "Admin all orders fetched successfully",
            totalOrders: orders.length,
            orders
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in admin fetch all oreders"
        });
    }
}

//update/change order status by admin only
const updateOrderStatusController = async(req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);
        if(!order) {
            return res.status(404).send({
                success: false,
                message: "Order not found"
            });
        }
        if(order.orderStatus === "processing") 
            order.orderStatus = "shipped";
        else if(order.orderStatus === "shipped") {
            order.orderStatus = "delivered";
            order.deliveredAt = Date.now();
        }
        else {
            return res.status(400).send({
                success: false,
                message: "Order has already been delivered"
            });
        }
        await order.save();
        res.status(200).send({
            success: true,
            message: "Order status updated by admin successfully",
        });
    }
    catch(error) {
        console.log(error);
        if(error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: "Invalid id at update order status fetch",
            });
        }
        res.status(500).send({
        success: false,
        message: "Error in admin update order status API",
        error,
     });
    }
};

module.exports = {
  createOrderController,
  getMyOrdersController,
  getSingleOrderController,
  getAllOrdersController,
  updateOrderStatusController
};
