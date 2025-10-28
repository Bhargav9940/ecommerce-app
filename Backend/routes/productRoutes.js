const express = require("express");
const { getAllProductsController, 
        getProductController, 
        createProductController, 
        updateProductController, 
        updateProductImgController, 
        deleteproductImageController,
        deleteProductController,
        productReviewController,
        getTopProductsController} = require("../controllers/productController");
const {isAuth, isAdmin} = require("../middlewares/isAuthenticated");
const singleUpload = require("../middlewares/multer");
const router = express.Router();

//get all
router.get("/get-all", getAllProductsController);

//get top products
router.get("/top", getTopProductsController);

//get single
router.get("/:id", getProductController);

//create product
router.post("/create", isAuth, isAdmin, singleUpload, createProductController);

//update product controller
router.put("/:id", isAuth, isAdmin, updateProductController);

//update product image
router.put("/update-img/:id", isAuth, isAdmin, singleUpload, updateProductImgController);

//delete product image
router.delete("/delete-img/:id", isAuth, isAdmin, deleteproductImageController);

//delete product
router.delete("/delete/:id", isAuth, isAdmin, deleteProductController);

//Review product
router.put("/:id/review", isAuth, productReviewController);

module.exports = router;