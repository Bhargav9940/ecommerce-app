const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");

//create category
const createCategoryController = async (req, res) => {
    try {
        const {category} = req.body;
        if(!category) {
            return res.status(400).send({
                success: false,
                message: "category is required"
            });
        }
        await categoryModel.create({category});
        res.status(201).send({
            success: true,
            message: `category: ${category} is created successfully`
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in create category API"
        });
    }
};

//get all category

const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await categoryModel.find({});
        res.status(200).send({
            success: true,
            message: "All categories fetched successfully",
            totalCat: categories.length,
            categories
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in get all categories API"
        });
    }
};

//delete category
const deleteCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.params.id);
        if(!category) {
            return res.status(404).send({
                success: false,
                message: "category not found for deletion"
            });
        }
        const products = await productModel.find({category: category._id});
        for(let i=0; i<products.length; i++) {
            const product = products[i];
            product.category = undefined;
            await product.save();
        }
        await category.deleteOne();
        res.status(200).send({
            success: true,
            message: "category deleted successfully"
        });
    }
    catch(error) {
        console.log(error);
        if(error.name === 'CastError') {
            return res.status(400).send({
                success: false,
                message: "Invalid Category id"
            });
        }
        res.status(500).send({
            success: false,
            message: "Error in delete category API"
        });
    }
}

//update category controller
const updateCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.params.id);
        if(!category) {
            return res.status(404).send({
                success: false,
                message: "category not found for updation"
            });
        }
        const { updatedCat } = req.body;
        if(!updatedCat) {
            return res.status(400).send({
                success: false,
                message: "New category is required"
            });
        }
        category.category = updatedCat;
        const products = await productModel.find({category: category._id});
        for(let i=0; i<products.length; i++) {
            const product = products[i];
            product.category = updatedCat;
            await product.save();
        }
        
        await category.save();
        res.status(200).send({
            success: true,
            message: "category updated successfully"
        });
    }
    catch(error) {
        console.log(error);
        if(error.name === 'CastError') {
            return res.status(400).send({
                success: false,
                message: "Invalid Category id"
            });
        }
        res.status(500).send({
            success: false,
            message: "Error in delete category API"
        });
    }
};

module.exports = {
    createCategoryController,
    getAllCategoriesController,
    deleteCategoryController,
    updateCategoryController
}