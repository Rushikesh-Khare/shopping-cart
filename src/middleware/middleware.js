const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const { isValid } = require('../util/validation');
const { isValidObjectId } = require('mongoose');
require('dotenv').config();
const { SECRET_KEY } = process.env;

const authentication = async function (req, res, next) {
    try {
        const token = req.headers['x-api-key'];
        if (!token) {
            return res.status(400).send({ 
                status: false, 
                message: "token is required" 
            });
        }
        jwt.verify(token, SECRET_KEY, function (error, decodedToken) {
            if (error) {
                return res.status(400).send({ 
                    status: false, 
                    message: error.message 
                });
            } else {
                req.userId = decodedToken.userId;
                next();
            }
        });

    } catch (error) {
        return res.status(500).send({ 
            status: false, 
            message: error.message 
        });
    }
}

const authorization = async function (req, res, next) {
    try {
        const loggedinUserId = req.userId;
        const paramUserId = req.params.userId
        if (!isValid(paramUserId)) {
            return res.status(400).send({ 
                status: false, 
                message: "invalid userId" 
            });
        }

        if(!isValidObjectId(paramUserId)) {
            return res.status(400).send({
                status: false, 
                message: "invalid object user id"
            })
        }
        const getData = await User.findById(paramUserId);
        if (!getData) {
            return res.status(404).send({ status: 
                false, 
                message: "data does not found" 
            });
        }
        if (loggedinUserId !== paramUserId) {
            return res.status(403).send({ 
                status: false, 
                message: "not authorized" 
            });
        }
        next();
    } catch (error) {
        return res.status(500).send({ 
            status: false, 
            message: error.message 
        });
    }
}

module.exports = { authentication, authorization};