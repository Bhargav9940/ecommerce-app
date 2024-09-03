const { createOrder, captureOrder } = require("../services/paypal");

const paymentPayController = async (req, res) =>  {
    try{
        const url = await createOrder();
        res.redirect(url);
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in payment pay API"
        });
    }
}

//payment complete
const paymentCompleteController = async (req, res) => {
    try {
        await captureOrder(req.query.token);
        res.status(200).send({
            success: true,
            message: "Payment successfull"
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in payment complete API",
            error
        });
    }
};

//payment cancel
const paymentCancelController = async (req, res) => {
    res.status(500).send({
        success: false,
        message: "Payment is failed"
    });
};

module.exports = {
    paymentPayController,
    paymentCompleteController,
    paymentCancelController
}