const express = require("express");
const router = express.Router();
const {
  addToCartController,
  getCartController,
  removeFromCartController,
  removeAllProductController
} = require("../controllers/cartController.js");
const { isAuth } = require("../middlewares/isAuthenticated");

router.post("/addItem/:id", isAuth, addToCartController);
router.get("/getCart", isAuth, getCartController);
router.post("/removeItem/:id", isAuth, removeFromCartController);
router.post("/removeAll/:id", isAuth, removeAllProductController);

module.exports = router;
