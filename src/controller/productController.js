const Product = require('../model/productModel');
const { isValid, isValidPrice, isValidNumber, isBoolean } = require('../util/validation');
const { isValidObjectId } = require('mongoose');
const { uploadFile } = require('../aws/aws');
//==================================== create product ============================================//
const createProduct = async function (req, res) {
    try {
        const data = req.body;
        let { title, description, price, currencyId, currencyFormat,
            style, availableSizes, installments } = req.body;

        console.log(data);

        //check detail is valid or not
        if (!isValid(title) || !isValid(description) || !isValid(currencyFormat) || !isValid(currencyId)) {
            return res.status(400).send({
                status: false,
                message: "provide valid detail"
            })
        }//recheckhere
        // console.log(typeof price);
        if (!price || !isValidPrice(price)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid price input"
            })
        }

        if (style) {
            if (typeof style !== "string") {
                return res.status(400).send({
                    status: false,
                    message: "provide valid style"
                })
            }
        }

        if (installments) {
            if (!isValidNumber(installments)) {
                return res.status(400).send({
                    status: false,
                    message: "provide valid installments"
                })
            }
        }

        let arr = JSON.parse(availableSizes);
        console.log(arr);
        if (!availableSizes || !Array.isArray(arr)) {
            return res.status(400).send({
                status: false,
                message: "provide at least one availableSizes"
            })
        }

        let productSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        for (let i = 0; i < arr.length; i++) {
            if (!isValid(arr[i]) || !productSize.includes(arr[i])) {
                return res.status(400).send({
                    status: false,
                    message: "please provide valid size input"
                })
            }
        }
        data.availableSizes = arr;
        console.log("line 63");
        let files = req.files;
        if (isValid(files)) {
            if (files.length > 1) {
                return res.status(400).send({ status: false, message: "You can't enter more than one file for create " });
            }

            let uploadFileURL = await uploadFile(files[0]);
            data.productImage = uploadFileURL;
        } else {
            return res.status(400).send({ status: false, message: "Profile Image is Mandatory" });
        }
        //check title is already exist or not
        const findTitleData = await Product.findOne({ title: title });
        if (findTitleData) {
            return res.status(400).send({
                status: false,
                message: "title is already exist "
            });
        }
        console.log("line 81");
        const createData = await Product.create(data);
        // console.log(createData);
        return res.status(201).send({
            status: true,
            message: "success",
            data: createData
        });
        console.log("line 88");

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//==================================== get all product ============================================//
const getProduct = async function (req, res) {
    try {
        const { size, name, priceGreaterThan, pricelessThan, priceSort } = req.query;
        console.log(req.query);
        const filter = { isDeleted: false };
        filter.availableSizes = size;
        if (name) {
            filter.title = {
                $regex: name,
                $options: "i"
            };
        }
        if (priceGreaterThan) {
            filter.price = { $gt: Number(priceGreaterThan) };
        }

        if (pricelessThan) {
            filter.price = { $gt: Number(pricelessThan) };
        }

        const sortData = {};
        if (priceSort) {
            sortData.price = Number(priceSort);
        }

        const getProductsData = await Product.find(filter).sort(sortData);

        if (getProductsData.length === 0) {
            return res.status(400).send({ status: false, message: "data does not found" });
        }
        return res.status(200).send({ status: true, message: "success", data: getProductsData });

    } catch (error) {
        return res.stauts(500).send({ status: false, message: error.message });
    }
}

//==================================== get product by product id ============================================//
const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId;
        console.log(typeof productId);
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "invalid product id" });
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "invalid product object id" });

        }
        findData = await Product.findById(productId);
        if (!findData) {
            return res.status(404).send({ status: false, message: "data does not found" });
        }
        return res.status(200).send({ status: true, message: "success", data: findData });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//==================================== update product ============================================//
const updateProduct = async function (req, res) {
    try {
        //check wheater product id is valid or not 
        const productId = req.params.productId;
        if (!isValid(productId)) {
            return res.status(400).send({
                status: false,
                message: "invalid productId"
            });
        }

        if (!isValidObjectId(productId)) {
            return res.stauts(400).send({
                status: false,
                message: "invalid product object id"
            });
        }
        //check is there any data exist or not and it is not deleted
        const findData = await Product.findOne({ _id: productId }, { isDeleted: false });
        if (!findData) {
            return res.status(400).send({
                status: false,
                message: "data does not found or deleted"
            });
        }
        const data = req.body;
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;
        const updateData = {};
        if (title) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "invalid title" });
            }
            //check title is unique or not 
            const findTitleData = await Product.findOne({ title: title });
            if (findTitleData) {
                return res.status(400).send({ status: false, message: "title is already exist " });
            }
            updateData.title = title;

        }

        if (description) {
            if (!isValid(description)) {
                return res.status(400).send({ status: false, message: "invalid description" });
            }
            updateData.description = description;
        }

        if (currencyId) {
            if (!isValid(currencyId)) {
                return res.status(400).send({ status: false, message: "invalid currencyId" });
            }
            updateData.currencyId = currencyId;
        }

        if (currencyFormat) {
            if (!isValid(currencyFormat)) {
                return res.status(400).send({ status: false, message: "invalid currencyFormat" });
            }
            updateData.currencyFormat = currencyFormat;
        }

        if (price) {
            if (!isValidPrice(price)) {
                return res.status(400).send({ status: false, message: "price should be number" });

            }
            updateData.price = price;
        }

        if (isFreeShipping) {
            if (!isBoolean(isFreeShipping)) {
                return res.status(400).send({
                    status: false,
                    message: "isFreeShipping should be boolean"
                });
            }
            if (isFreeShipping == true) {
                updateData.isFreeShipping = isFreeShipping;
            }
        }

        if (style) {
            if (!isValid(style)) {
                return res.status(400).send({ status: false, message: "invali style " });
            }
            updateData.style = style;
        }

        if (availableSizes) {
            const arr = JSON.parse(availableSizes);
            if (typeof arr !== 'object' || arr.lenght === 0) {
                return res.status(400).send({ status: false, message: "available sizes is not valid" });
            }
            const productAvailableSize = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            for (let i = 0; i < arr.lenght; i++) {
                if (!productAvailableSize.includes(arr[i])) {
                    return res.status(400).send({ status: false, message: "please enter valid size parameter" });
                }
            }
            updateData.availableSizes = arr;
        }

        if (installments) {
            if (!isValidNumber(installments)) {
                return res.status(400).send({ status: false, message: "invalid installment input" });
            }
            updateData.installments = installments
        }
        //aws update file
        const files = req.files;
        if (files) {
            if (files.lenght > 0) {
                const updateFileURL = uploadFile(files[0]);
                updateData.productImage = updateFileURL;
            }
        }

        const updateProductData = await Product.findByIdAndUpdate(productId, updateData, { new: true });
        return res.status(200).send({ status: true, message: "success", data: updateProductData });
    } catch (error) {
        return res.stauts(500).send({ status: false, message: error.message });
    }
}

//==================================== delete product ============================================//
const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        console.log("line 291");
        if (!isValidObjectId(productId)) {
            return res.status(400).send({
                status: false,
                message: "invalid product id"
            });
        }
        //check is there any data exist having product id and it is not deleted
        const isDataExist = await Product.findOne({
            _id: productId,
            isDeleted: false
        });
        if (!isDataExist) {
            return res.status(404).send({ status: false, message: "data does not found" });
        }
        console.log("line 300");
        const deleteData = {};
        deleteData.isDeleted = true;
        deleteData.deletedAt = new Date();

        const deleteProductData = await Product.findOneAndUpdate({ _id: productId }, deleteData, { new: true });
        return res.status(200).send({ status: true, message: "success", data: deleteProductData });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { createProduct, getProduct, getProductById, updateProduct, deleteProduct };








// "status": false,
//     "message": "Product validation failed: productImage: Cast to string failed for value \"Promise { <pending> }\" (type Promise) at path \"productImage\""