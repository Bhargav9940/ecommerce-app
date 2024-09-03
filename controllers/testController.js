const testController = (req, res) => {
    res.status(200).send({
        message: "This is a test controller.",
        success: true
    });
};

module.exports = {
    testController
};