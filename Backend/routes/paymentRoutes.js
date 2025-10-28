const express = require("express");
const router = express.Router();

const {isAuth} = require("../middlewares/isAuthenticated");

const { createPayPalOrder, capturePayPalOrder } = require('../controllers/paymentController');

router.get("/", (req, res) => {
    res.render('payment');
});

//Create PayPal Order
router.post("/create-paypal-order/:orderId", isAuth, createPayPalOrder);

//Capture PayPal Order
router.post("/capture-paypal-order/:paypalOrderId", isAuth, capturePayPalOrder);

module.exports = router;