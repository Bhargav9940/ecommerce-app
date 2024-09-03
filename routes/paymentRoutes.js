const express = require("express");
const router = express.Router();
const { paymentPayController, paymentCompleteController, paymentCancelController } = require("../controllers/paymentController");
const {isAuth} = require("../middlewares/isAuthenticated");

router.get("/", (req, res) => {
    res.render('payment');
});

//payment pay page
router.post("/pay", isAuth, paymentPayController);

//payment complete
router.get("/payment-complete", isAuth, paymentCompleteController);

//payment cancel
router.get("/payment-cancel", isAuth, paymentCancelController);

module.exports = router;