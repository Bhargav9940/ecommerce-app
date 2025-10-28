const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");

const addToCartController = async(req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;
        let cart = await cartModel.findOne({userId: userId});
        let product = await productModel.findById(productId);
        if(!product) {
            return res.status(400).send({
                success: false,
                message: "Product does not exits"
            });
        }
        if(product.stock === 0) {
            return res.status(409).send({
                success: false,
                message: "Product is out of stock"
            });
        }
        //if cart is not available, create new one
        if(!cart) {
            cart = await cartModel.create({
                userId: userId,
                items: [
                    {
                        productId: productId,
                    }
                ]
            });
        }
        else {
            if(cart.items) {
                let indexOfItem = cart.items.findIndex(item => item.productId == productId);
                if(indexOfItem != -1) {
                    cart.items[indexOfItem].quantity++;
                }
                else {
                    let item = {
                        productId: productId,
                    };
                    cart.items.push(item);
                }
            }
            else {
                let item = {
                    productId: productId,
                };
                cart.items = [];
                cart.items.push(item);
            }
        }
        await cart.save();
        res.status(201).send({
            success: true,
            message: "Product is added to cart"
        });
    }
    catch(error) {
        console.log(error);
        if(error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: "Invalid id at add to cart",
            });
        }
        res.status(500).send({
            success: false,
            message: "Error in add to cart API",
            error
        });
    }
}

const getCartController = async(req, res) => {
    try {
        const cart = await cartModel.findOne({userId: req.user._id});
    
        if(!cart) {
            return res.status(404).send({
                success: false,
                message: "No cart found"
            });
        }

        let items = [];
        for(let i=0; i<cart.items.length; i++) {
            const itemDetails = await productModel.findById(cart.items[i].productId);
            if(!itemDetails) {
                await productModel.findByIdAndDelete(cart.items[i].productId);
            }
            else {
                const obj = {
                    quantity: cart.items[i].quantity,
                    name: itemDetails.name,
                    price: itemDetails.price,
                    stock: itemDetails.stock,
                    images: itemDetails.images,
                    productId: itemDetails._id,
                    shippingCharges: (itemDetails.price > 100) ? 0 : 10
                }
                items.push(obj);
            }
        }

        res.status(200).send({
            success: true,
            message: "Cart found",
            items
        });

    }
    catch(error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error in get cart API'
        });
    }
}

const removeFromCartController = async(req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;
        let cart = await cartModel.findOne({userId: userId});

        let product = await productModel.findById(productId);
        if(!product) {
            return res.status(400).send({
                success: false,
                message: "Product does not exits"
            });
        }
        
        //if cart is not available, Show no cart found
        if(!cart) {
            return res.status(404).send({
                success: false,
                message: "No cart found"
            });
        }
        else {
            if(cart.items) {
                let indexOfItem = cart.items.findIndex(item => item.productId == productId);
                if(indexOfItem != -1) {
                    cart.items[indexOfItem].quantity--;
                    if(cart.items[indexOfItem].quantity === 0) {
                        cart.items.splice(indexOfItem, 1);
                    }
                }
                else {
                    return res.status(404).send({
                        success: false,
                        message: "item not found in cart"
                    });
                }
            }
        }
        await cart.save();
        res.status(201).send({
            success: true,
            message: "Product is removed from cart"
        });
    }
    catch(error) {
        console.log(error);
        if(error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: "Invalid id at remove from cart",
            });
        }
        res.status(500).send({
            success: false,
            message: "Error remove from cart API",
            error
        });
    }
}


const removeAllProductController = async(req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;
        let cart = await cartModel.findOne({userId: userId});

        let product = await productModel.findById(productId);
        if(!product) {
            return res.status(400).send({
                success: false,
                message: "Product does not exits"
            });
        }
        
        //if cart is not available, Show no cart found
        if(!cart) {
            return res.status(404).send({
                success: false,
                message: "No cart found"
            });
        }
        else {
            if(cart.items) {
                let indexOfItem = cart.items.findIndex(item => item.productId == productId);
                if(indexOfItem != -1) {
                    cart.items[indexOfItem].quantity = 0;
                    cart.items.splice(indexOfItem, 1);
                }
                else {
                    return res.status(404).send({
                        success: false,
                        message: "item not found in cart"
                    });
                }
            }
        }
        await cart.save();
        res.status(201).send({
            success: true,
            message: "Product is removed all from cart"
        });
    }
    catch(error) {
        console.log(error);
        if(error.name === "CastError") {
            return res.status(500).send({
                success: false,
                message: "Invalid id at remove from cart",
            });
        }
        res.status(500).send({
            success: false,
            message: "Error remove from cart API",
            error
        });
    }
}

module.exports = {
    addToCartController,
    getCartController,
    removeFromCartController,
    removeAllProductController
}