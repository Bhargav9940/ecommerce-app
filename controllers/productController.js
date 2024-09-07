const productModel = require("../models/productModel");
const { getDataUri } = require("../utils/features");
const cloudinary = require("cloudinary");
//get all products
const getAllProductsController = async (req, res) => {
    try {
        const { keyword, category } = req.query;
        const queryObj = {};
        if(keyword) {
            queryObj.name = {
                $regex: keyword,
                $options: "i"
            }
        }
        if(category) {
            queryObj.category = category
        }

        const products = await productModel.find(queryObj).populate("category");  // Populate the 'category' field with data from the related collection
        res.status(200).send({
            success: true,
            message: "All products fetched successfully",
            totalProducts: products.length,
            products
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in get all products API"
        });
    }
};

//get top products
const getTopProductsController = async (req, res) => {
    try {
        const products = await productModel.find({}).sort({rating: -1}).limit(3);
        res.status(200).send({
            success: true,
            message: "Top 3 products fetched successfully",
            products
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            messagge: "Error in get top products API",
            error
        });
    }
}

//get single product
const getProductController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
    if(!product) {
        return res.status(404).send({
            success: false,
            message: "Product not found"
        });
    }
    res.status(200).send({
        success: true,
        message: "Product is fetched successfully",
        product
    });
    }
    catch(error) {
        console.log(error);
        //CastError or object Id invalid
        if(error.name === "CastError") {
            res.status(500).send({
                success: false,
                message: "Invalid ObjectId"
            });
        }
        res.status(500).send({
            success: false,
            message: "Error in get single product fetching API",
            error
        });
    }
};

//create product
const createProductController = async (req, res) => {
    try {
        const {name, description, price, stock, category} = req.body;
        if(!name || !description || !price || !stock) {
            return res.status(400).send({
                success: false,
                message: "all fields are required"
            });
        }
        if(!req.file) {
            return res.status(400).send({
                success: false,
                message: "image is required"
            });
        }
        const file = getDataUri(req.file);
        const cdb = await cloudinary.v2.uploader.upload(file.content);
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        };
        await productModel.create({
            name,
            description,
            price,
            stock,
            category,
            images: [image]
        });
        res.status(200).send({
            success: true,
            message: "Product is created successfully"
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in create product API",
            error
        });
    }
}

//update product 
const updateProductController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if(!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }
        const { name, description, price, stock, category } = req.body;
        if(name) product.name = name;
        if(description) product.description = description;
        if(price) product.price = price;
        if(stock) product.stock = stock;
        if(category) product.category = category;

        await product.save();
        res.status(200).send({
            success: true,
            message: "Product updated successfully"
        });
    }
    catch(error) {
        console.log(error);
        //CastError or object Id invalid
        if(error.name === "CastError") {
           res.status(400).send({
               success: false,
               message: "Invalid ObjectId"
           });
        }
        res.status(500).send({
            success: false,
            message: "Error in update-product API"
        });
    }
};

const updateProductImgController = async(req, res) => {
    try{
        const product = await productModel.findById(req.params.id);
        if(!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }
        if(!req.file) {
            return res.status(400).send({
                success: false,
                message: "Image is required"
            })
        }
        const file = getDataUri(req.file);
        const cdb = await cloudinary.v2.uploader.upload(file.content);
        const image = {
            public_id: cdb.public_id,
            url: cdb.secure_url
        };
        product.images.push(image);
        await product.save();
        res.status(200).send({
            success: true,
            message: "Product image updated successfully"
        });
    }
    catch(error) {
        console.log(error);
        //CastError or object Id invalid
        if(error.name === "CastError") {
           res.status(400).send({
               success: false,
               message: "Invalid ObjectId"
           });
        }
        res.status(500).send({
            success: false,
            message: "Error in update-product-image API"
        });
    }
};

//delete product image
const deleteproductImageController = async(req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if(!product) {
            return res.status(404).send({
                success: false,
                message: "product not found"
            });
        }

        //finding image id
        const id = req.query.id;
        if(!id) {
            return res.status(400).send({
                success: false,
                message: "image id is required"
            });
        }

        //check image exist or not
        let isExist = -1;
        product.images.forEach((item, index) => {
            if(item._id.toString() === id.toString()) isExist=index;
        })
        if(isExist<0) {
            return res.status(404).send({
                success: false,
                message: "Product image not found"
            });
        }

        //delete product image
        await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
        product.images.splice(isExist, 1);
        await product.save();
        res.status(200).send({
            success: true,
            message: "Product image deleted successfully"
        });
    }
    catch(error) {
        console.log(error);
        //CastError or object Id invalid
        if(error.name === "CastError") {
           res.status(400).send({
               success: false,
               message: "Invalid ObjectId"
           });
        }
        res.status(500).send({
            success: false,
            message: "Error in delete product image API"
        });
    }
};

//delete product
const deleteProductController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if(!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }
        //deleting images in cloudinary
        for(let index=0; index<product.images.length; index++) {
            await cloudinary.v2.uploader.destroy(product.images[index].public_id);
        }
        //delete product in Mongodb
        await product.deleteOne();
        //marked for review for status code
        res.status(200).send({
            success: false,
            message: "Product is deleted successfully"
        });
    }
    catch(error) {
        console.log(error);
        //CastError or object Id invalid
        if(error.name === "CastError") {
           res.status(400).send({
               success: false,
               message: "Invalid ObjectId"
           });
        }
        res.status(500).send({
            success: false,
            message: "Error in delete product API"
        });
    }

};


//product review
const productReviewController = async (req, res) => {
    try {
        const {comment, rating} = req.body;
        if(!comment || !rating) {
            return res.status(400).send({
                success: false,
                message: "All fields are mandatory"
            });
        }
        const product = await productModel.findById(req.params.id);
        if(!product){
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }
        const alreadyReviewed = await product.reviews.find((rev) => rev.user.toString() === req.user._id.toString());
        if(alreadyReviewed) {
            return res.status(401).send({
                success: false,
                message: "Already submitted a review"
            });
        }
        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, review) => review.rating + acc, 0) / product.reviews.length;
        await product.save();
        res.status(200).send({
            success: true,
            message: "Review added successfully"
        });
    }
    catch(error) {
        console.log(error);
        //CastError or object Id invalid
        if(error.name === "CastError") {
           res.status(400).send({
               success: false,
               message: "Invalid ObjectId"
           });
        }
        res.status(500).send({
            success: false,
            message: "Error in product review comment API"
        });
    }
    
};



module.exports = {
    getAllProductsController,
    getProductController,
    createProductController,
    updateProductController,
    updateProductImgController,
    deleteproductImageController,
    deleteProductController,
    productReviewController,
    getTopProductsController
}