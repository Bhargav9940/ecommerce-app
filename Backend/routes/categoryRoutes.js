const express = require("express");
const {isAuth, isAdmin} = require("../middlewares/isAuthenticated");
const { createCategoryController, 
        getAllCategoriesController, 
        deleteCategoryController,
        updateCategoryController } = require("../controllers/categoryController");

const router = express.Router();

//create category
router.post("/create", isAuth, isAdmin, createCategoryController);

//get all category
router.get("/get-all", getAllCategoriesController);

//delete category by id
router.delete("/delete/:id", isAuth, isAdmin, deleteCategoryController);

//update category by id
router.put("/update/:id", isAuth, isAdmin, updateCategoryController);

module.exports = router;