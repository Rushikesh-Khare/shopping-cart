const Orders = require("../model/orderModel");
const User = require("../model/userModel");
const Cart = require("../model/cartModel");
const { isValid } = require("../util/validation")
const { isValidObjectId } = require('mongoose');
async function createModel(req, res) {
    
    try {
        const userId = req.params.userId;
        const cart = await Cart.findOne({
            userId: userId
        })
        if (!cart) {
            return res.status(400).send({
                status: false,
                message: "cart is not empty"
            })
        }
        const totalQuantity = cart.items.reduce((acc, curr) => {
            acc += curr.quantity
            return acc
        }, 0)



        obj = {
            userId: userId,
            items: cart.items,
            totalPrice: cart.totalPrice,
            totalItems: cart.totalItems,
            totalQuantity: totalQuantity,

        }


        const creaOrderData = await Orders.create(obj)

        res.status(201).send({
            status: true,
            data: creaOrderData,
            msg: "succesfully created"
        })
    } catch (error) {
        if (error.message.includes("validation")) {
            return res.status(400).send({
                status: false,
                message: error.message
            })
        }
        return res.status(500).send({
            status: false,
            err: error.message
        })
    }
}



async function updateModel(req, res) {
    try {
        const { orderId } = req.body;
        if (!isValid(orderId)) {
            return res.status(400).send({
                status: false,
                message: "invalid orderId"
            });
        }

        if (!isValidObjectId(orderId)) {
            return res.status(400).send({
                status: false,
                message: "invalid order object id"
            });
        }
        const findOrderId = await Orders.findById(orderId);
        if (!findOrderId) {
            return res.status(400).send({
                status: false,
                message: "given order does not exist "
            });

        }

        if (!req.body.status) {
            return res.status(400).send({
                status: false,
                msg: "status required"
            })
        }

        if (!isValid(req.body.status)) {
            return res.status(400).send({
                status: false,
                message: "invalid status"
            });
        }
        // const state = ["pending", completed, cancled];

        if (req.body.status) {
            if (req.body.status === "cancled") {
                if (findOrderId.cancellable === true) {
                    var updated = await Orders.findByIdAndUpdate(
                        orderId,
                        { status: "cancled" },
                        { new: true }
                    )
                    return res.status(200).send({
                        status: true,
                        data: updated,
                        message: "success"
                    })
                }
                else {
                    return res.status(400).send({
                        status: false,
                        message: "order cant be cancellabe"
                    });
                }
            }

            if (req.body.status === "completed") {

                var updated = await Orders.findByIdAndUpdate(
                    orderId,
                    { status: "completed" },
                    { new: true }
                )
                return res.status(200).send({
                    status: true,
                    data: updated,
                    message: "ordere is completed"
                })
            }

            if (req.body.status === "pending") {

                if (findOrderId.status !== "pending") {
                    var updated = await Orders.findByIdAndUpdate(
                        orderId,
                        { status: "pending" },
                        { new: true }
                    )
                    return res.status(200).send({
                        status: true,
                        data: updated,
                        message: "ordere is pending"
                    })
                }
                else {
                    return res.status(400).send({
                        status: false,
                        data: updated,
                        message: "already pending"
                    })
                }

            }
        }
        else {
            return res.status(400).send({
                status: false,
                message: "your status state is incorrect it should be between this " + "pending, completed, cancled"
            })
        }

    } catch (error) {
        if (error.message.includes("validation")) {
            return res.status(400).send({
                status: false,
                message: error.message
            })
        }
        return res.status(500).send({ err: error.message })
    }
}

module.exports = { createModel, updateModel };