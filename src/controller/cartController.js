const Cart = require('../model/cartModel');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const { isValid, isValidNumber } = require('../util/validation');
const { isValidObjectId } = require('mongoose');
//====================================create cart===============================//
const createCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        // console.log(req.body);
        //is valid userid
        if (!isValid(userId)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid user id"
            });
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                message: "invalid object id"
            });
        }



        //is there any cart exist for given userid
        const isCartExist = await Cart.findOne({ userId: userId });

        let totalPrice = 0
        let totalItems = 0
        let { productId, quantity } = data;

        if (!isValid(productId)) {
            return res.status(400).send({
                status: false,
                message: "please provid valid cart id"
            });
        }

        if ((!isValidObjectId(productId))) {
            return res.status(400).send({
                status: false,
                message: "please provid valid object id"
            });
        }
        //check product id exist or not 
        const isProductExist = await Product.findOne({
            _id: productId,
            isDeleted: false

        });
        if (!isProductExist) {
            return res.status(404).send({
                status: false,
                message: "product does not exist "
            });

        }
        if (!isValidNumber(quantity)) {
            return res.status(400).send({
                status: false,
                message: "invalid quantity input"
            });
        }
        quantity = Number(quantity);
        if (quantity < 1) {
            return res.status(400).send({
                status: false,
                message: "please enter valid quantity"
            });
        }
        if (!isCartExist) {
            data.items = [];
            data.items.push({
                productId,
                quantity
            })
            data.userId = userId;
            data.totalPrice = isProductExist.price * quantity;
            data.totalItems = 1;
            const createCartFirstTime = await Cart.create(data);
            return res.status(201).send({
                status: true,
                message: "cart created",
                data: createCartFirstTime,
            })
        } else {
            //check product is already exist in cart or not 
            let isProductExistInCart = false;
            for (let i = 0; i < isCartExist.items.length; i++) {
                if (productId == isCartExist.items[i].productId) {
                    isCartExist.totalPrice += isProductExist.price * quantity;

                    isCartExist.items[i].quantity += quantity;
                    isProductExistInCart = true;
                    break;
                }
            }
            if (isProductExistInCart == false) {
                isCartExist.items.push({
                    productId,
                    quantity
                })
                isCartExist.totalPrice += isProductExist.price * quantity;
                isCartExist.totalItems += 1;

            }


            const updateCart = await isCartExist.save();
            return res.status(200).send({
                status: true,
                message: "cart updated",
                data: updateCart
            });
        }

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

//====================================get cart===============================//

const getCart = async (req, res) => {
    try {
        const userId = req.params.userId;

        //is valid userid
        if (!isValid(userId)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid user id"
            });
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                message: "invalid object id"
            });
        }

        

        //check is there any cart exist or not 

        const isCartExist = await Cart.findOne({
            userId: userId
        });
        if (!isCartExist) {
            return res.status(404).send({
                status: false,
                message: "cart instance does not found"
            });
        }
        return res.status(200).send({
            status: true,
            message: "success",
            data: isCartExist
        });

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

//====================================update cart===============================//

const updateCart = async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;

        const { productId, removeProduct } = data;
        //is valid userid
        if (!isValid(userId)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid user id"
            });
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                message: "invalid object id"
            });
        }


        //validate cartId


        //check is there any cart exist or not 

        const isCartExist = await Cart.findOne({
            userId: userId
        });
        if (!isCartExist) {
            return res.status(404).send({
                status: false,
                message: "cart instance does not found"
            });
        }
        let totalItems = isCartExist.totalItems;
        let totalPrice = isCartExist.totalPrice;
        if (!isValid(productId)) {
            return res.status(400).send({
                status: false,
                message: "invalid productId"
            });
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "invalid object id"
            });
        }

        //check product is exist or not 
        const isProductExist = await Product.findOne({
            _id: productId,
            isDeleted: false
        });

        if (!isProductExist) {
            return res.status(400).send({
                status: false,
                message: "product does not exist"
            });
        }
        //check product exist in cart or not 
        let productIdExist = false;
        let { items } = isCartExist;
        if (items.length === 0) {
            return res.status(400).send({
                status: false,
                message: "cart is already empty"
            });
        }
        for (let i = 0; i < items.length; i++) {
            if (productId == items[i].productId) {
                productIdExist = true;
                break;
            }
        }
        if (productIdExist == false) {
            return res.status(400).send({
                status: false,
                message: "there is no product in cart having given product id"
            })
        }

        if (!removeProduct || !isValidNumber(removeProduct)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid input"
            });
        }
        if (removeProduct == 0) {
            for (let i = 0; i < items.length; i++) {
                if (productId == items[i].productId) {
                    totalPrice -= isProductExist.price * items[i].quantity;
                    totalItems -= 1;
                    items.splice(i, 1);
                    break;
                }


            }
            // isCartExist.totalItems = 
        } else if (removeProduct == 1) {
            for (let i = 0; i < items.length; i++) {
                if (productId == items[i].productId) {
                    totalPrice -= isProductExist.price
                    if (items[i].quantity == 1) {
                        items.splice(i, 1);
                        totalItems -= 1;
                    } else {
                        items[i].quantity -= 1;
                    }
                }
            }
        } else {
            return res.status(400).send({
                status: false,
                message: "please enter valid number"
            });
        }

        isCartExist.items = items;
        isCartExist.totalItems = totalItems;
        isCartExist.totalPrice = totalPrice;
        const updateData = await isCartExist.save();
        return res.status(200).send({
            status: true,
            message: "success",
            data: updateData
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });

    }
}

//====================================delete cart===============================//

const deleteCart = async (req, res) => {
    try {
        const userId = req.params.userId;


        //is valid userid
        if (!isValid(userId)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid user id"
            });
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                message: "invalid object id"
            });
        }

        const isUserExist = await User.findById(userId);
        if (!isUserExist) {
            return res.status(404).send({
                status: false,
                message: "user does not exist"
            });
        }


        //check is there any cart exist or not 

        const isCartExist = await Cart.findOne({
            userId: userId
        });
        if (!isCartExist) {
            return res.status(404).send({
                status: false,
                message: "cart instance does not found"
            });
        }
        const deleteData = {};
        deleteData.items = [];
        deleteData.totalItems = 0;
        deleteData.totalPrice = 0;

        const delteDataOpe = await Cart.updateOne({ userId: userId }, deleteData, { new: true });
        return res.status(200).send({
            status: true,
            message: "succeess",
            data: delteDataOpe
        })
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });

    }
}

module.exports = { createCart, getCart, updateCart, deleteCart };