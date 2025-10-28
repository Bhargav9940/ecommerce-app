const express = require("express");
const {isAuth, isAdmin} = require("../middlewares/isAuthenticated");
const { createOrderController,
        getMyOrdersController, 
        getSingleOrderController, 
        getAllOrdersController,
        updateOrderStatusController,
        cancelMyOrderController } = require("../controllers/orderController");

const router = express.Router();

//create category
router.post("/create", isAuth, createOrderController);

//get my orders
router.get("/my-orders", isAuth, getMyOrdersController);

//get single orders
router.get("/my-orders/:id", isAuth, getSingleOrderController);

// cancel order
router.post("/cancel-order/:id", isAuth, cancelMyOrderController);


//////////////////////ADMIN\\\\\\\\\\\\\\

//for admin only
router.get("/admin/all-orders", isAuth, isAdmin, getAllOrdersController);

//update orders status
router.put("/admin/order/:id", isAuth, isAdmin, updateOrderStatusController);

module.exports = router;