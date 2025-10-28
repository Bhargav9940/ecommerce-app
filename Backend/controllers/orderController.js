const mongoose = require("mongoose");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");

const createOrderController = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await userModel.findById(req.user._id).session(session);
    if(!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({
            success: false,
            message: "User does not exists"
        });
    }
    if(!user.shippingInfo) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({
            success: false,
            message: "User's shipping Info does not exist"
        });
    }

    const {
      orderItems,
      paymentInfo
    } = req.body;

    //validation
    if (
      !orderItems ||
      !paymentInfo
    ) {
      return res.status(400).send({
        success: false,
        message: "orderItems and paymentInfo are mandatory",
      });
    }

    //redefined orderItems
    let finalOrderItems = [];
    let totalPrice = 0;

    //stock validation & unavailability
    const unavailableProducts = [];
    const notEnoughStockProducts = [];

    for (let i = 0; i < orderItems.length; i++) {
      const { product: productId, quantity } = orderItems[i];
      const product = await productModel
        .findById(productId)
        .session(session);

      if (!product) {
        unavailableProducts.push(productId);
        continue;
      }

      if (product.stock < orderItems[i].quantity) {
        notEnoughStockProducts.push({
          productId: product._id,
          requestedQty: orderItems[i].quantity,
          availableQty: product.stock,
        });
        continue;
      }

      //update stock
      product.stock -= quantity;
      await product.save({ session });

      //push redefined items
      finalOrderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || null,
        quantity
      });

      totalPrice += product.price*quantity;
    }

    totalPrice = Number(totalPrice.toFixed(2));

    //if any of the prodcuct is unavailable the transaction aborts
    if (unavailableProducts.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).send({
        success: false,
        message: "Some products do not exists",
        unavailableProducts,
      });
    }

    //if any of the product is out of stock transaction aborts
    if (notEnoughStockProducts.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({
        success: false,
        message: "Products out of stock",
        notEnoughStockProducts,
      });
    }

    //calculate orderTotal
    const tax = calculateTax(totalPrice);
    let shippingCharges = calculateShippingCharges(totalPrice);
    const orderTotal = Number((totalPrice + tax + shippingCharges).toFixed(2));

    //order creation
    const order = await orderModel.create(
      [{
        user: req.user._id,
        shippingInfo: user.shippingInfo,
        orderItems: finalOrderItems,
        paymentInfo,
        totalPrice,
        tax,
        shippingCharges,
        orderTotal,
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    //Fetch updated stock for ordered products
    const updatedProducts = await productModel.find({
        _id: { $in: finalOrderItems.map(item => item.product) }
    }).select("_id name stock");

    res.status(201).send({
      success: true,
      message: "Order is placed successfully.",
      order,
      updatedProducts
    });
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
    const orders = await orderModel.find({ user: req.user._id });
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "No orders found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Orders fetched successfully",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
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
    const order = await orderModel.findOne({_id: req.params.id});
    if (!order) {
      return res.status(404).send({
        success: fales,
        message: "Order not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "order fetched successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
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

//cancel order controller
const cancelMyOrderController = async (req, res) => {
  try {
    const { id:orderId } = req.params;
    if(!orderId) {
      return res.status(400).send({
        success: false,
        message: "orderId is required"
      });
    }
    const order = await orderModel.findById(orderId);
    if(!order) {
      return res.status(404).send({
        success: false,
        message: "order not found!"
      });
    }
    if(order.orderStatus === "cancelled") {
      return res.status(200).send({
        success: true,
        message: "Order has already been cancelled"
      });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.paymentInfo.status = "failed";
    await order.save();

    let undefinedProducts = [];
    let notFoundProducts = [];


    for (const item of order.orderItems) {
      if(item.product) {
        const product = await productModel.findById(item.product);
        if(product) {
          product.stock += item.quantity;
          await product.save();
        }
        else {
          notFoundProducts.push(item);
        }
      }
      else {
        undefinedProducts.push(item);
      }
    }
    
    return res.status(200).send({
      success: true,
      message: "Order cancelled successfully, valid product are restocked",
      undefinedProducts,
      notFoundProducts
    })

  }
  catch(error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in cancel my order API"
    })
  }
}

/////////////Admin\\\\\\\\\\\

//get all order admin
const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).send({
      success: true,
      message: "Admin all orders fetched successfully",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in admin fetch all oreders",
    });
  }
};

//update/change order status by admin only
const updateOrderStatusController = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }
    if (order.orderStatus === "processing") order.orderStatus = "shipped";
    else if (order.orderStatus === "shipped") {
      order.orderStatus = "delivered";
      order.deliveredAt = Date.now();
    } else {
      return res.status(400).send({
        success: false,
        message: "Order has already been delivered",
      });
    }
    await order.save();
    res.status(200).send({
      success: true,
      message: "Order status updated by admin successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
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

function calculateTax(totalPrice) {
    return 0;
}

function calculateShippingCharges(totalPrice) {
    return (totalPrice>=100) ? 0 : 50;
}

module.exports = {
  createOrderController,
  getMyOrdersController,
  getSingleOrderController,
  getAllOrdersController,
  updateOrderStatusController,
  cancelMyOrderController
};
