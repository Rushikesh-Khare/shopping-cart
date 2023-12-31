const User = require('../model/userModel');
const { isValid, isValidEmail, isValidMobile, isValidPassword, isValidPincode } = require('../util/validation');
const bcrypt = require('bcrypt');
const { uploadFile } = require('../aws/aws');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { SECRET_KEY } = process.env;
const { isValidObjectId } = require("mongoose");

//==================================== User Register ============================================//
const userRegister = async (req, res) => {
    try {
        const data = req.body;
        const { fname, lname, email, phone, password, address } = data;
        console.log("line no 8");
        //check is valid or not 
        if (!isValid(fname) || !isValid(lname) || !isValid(phone) || !isValid(email) || !isValid(password)) {
            return res.status(400).send({
                status: false,
                message: "all fields are requrire"
            });
        }

        //check wheater address is valid object or not
        if (!address || typeof (address) !== 'object') {
            return res.status(400).send({ status: false, message: "invalid address" });

        }


        if (!isValid(address.shipping.street) || !isValid(address.shipping.city)) {
            return res.status(400).send({
                status: false,
                message: "please provide all fields of shipping address"
            });
        }

        if (!address.shipping.pincode || !isValidPincode(address.shipping.pincode)) {
            return res.status(400).send({
                status: false,
                message: "invalid shipping pincode"
            });
        }

        if (!address.billing.pincode || !isValidPincode(address.billing.pincode)) {
            return res.status(400).send({
                status: false,
                message: "invalid billing pincode"
            });
        }


        //validate email
        if (!isValidEmail(email)) {
            return res.status(400).send({
                status: false,
                message: "invalid email"
            });
        }

        //validate mobile
        if (!isValidMobile(phone)) {
            return res.status(400).send({
                status: false,
                message: "invalid phone"
            });
        }

        //validate password

        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({
                status: false,
                message: "password length criteria does not match"
            });

        }
        if (!isValidPassword(password)) {
            return res.status(400).send({
                status: false,
                message: "password is not valid"
            });
        }

        //password bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        data.password = hashedPassword;
        //aws s3
        const files = req.files;
        if (isValid(files)) {
            if (files.length > 1) {
                return res.status(400).send({
                    status: false,
                    message: "You can't enter more than one file for create "
                });
            }

            let uploadFileURL = await uploadFile(files[0]);
            data.profileImage = uploadFileURL;
        } else {
            return res.status(400).send({
                status: false,
                message: "Profile Image is Mandatory"
            });
        }

        //check whether phone is already exist or not
        const findUser = await User.findOne({
            $or: [{ phone: phone }, { email: email }]
        });
        if (findUser) {
            return res.status(400).send({
                status: false,
                message: "phone no. and email is already exist"
            });
        }
        const createData = await User.create(data);

        return res.status(201).send({
            status: true,
            message: "User created successfully",
            data: createData
        });

    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}


//==================================== Login User ============================================//

const userLogin = async (req, res) => {
    try {
        const data = req.body;
        const { email, password } = data;

        if (!isValid(email) || !isValid(password)) {
            return res.status(400).send({
                status: false,
                message: "EmailId is mandatory"
            });
        }
        if (!isValidEmail(email)) {
            return res.status(400).send({
                status: false,
                message: "please enter valid email"
            });
        }
        if (!isValidPassword(password)) {
            return res.status(400).send({
                status: false,
                message: "please enter valid password"
            });
        }

        const findData = await User.findOne({
            email: email
        });
        if (!findData) {
            return res.status(404).send({
                status: false,
                message: "user not found"
            });
        }
        const hash = findData.password;
        const isCorrect = bcrypt.compare(hash, password);
        if (!isCorrect) {
            return res.status(400).send({
                status: false,
                message: "Password is incorrect"
            });
        }

        const token = jwt.sign({
            userId: findData._id.toString()
        }, SECRET_KEY);
        res.setHeader("x-api-key", token);
        return res.status(200).send({
            status: true,
            message: "User login successfull",
            data: token
        });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//==================================== get User Data ============================================//
const getUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                message: "invalid userId"
            });
        }

        //check whether token contanin userid and param id is same

        const getData = await User.findById(userId);
        if (!getData) {
            return res.status(404).send({
                status: false,
                message: "data does not found"
            });
        }

        return res.status(200).send({
            status: true,
            message: "User profile details",
            data: getData
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        });
    }
}

//==================================== update User ============================================//
const updateUser = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.params.userId;
        const { fname, lname, email, phone, password, address } = data;
        //check userId is valid or not 

        const newObj = {};
        //if user entering any field validate that field

        if (fname) {
            if (!isValid(fname)) {
                return res.status(400).send({
                    status: false,
                    message: "invalid fname"
                });
            }
            newObj.fname = fname;
        }

        if (lname) {
            if (!isValid(lname)) {
                return res.status(400).send({
                    status: false,
                    message: "invalid lname"
                });
            }
            newObj.lname = lname;
        }

        if (email) {
            if (!isValid(email)) {
                return res.status(400).send({
                    status: false,
                    message: "invalid email"
                });
            } if (!isValidEmail(email)) {
                return res.status(400).send({
                    status: false,
                    message: "email is not valid"
                });
            }
            //check new email is already exist in database or not
            const isEmailExist = await User.findOne({
                email: email
            })
            if (isEmailExist) {
                return res.status(400).send({
                    status: false,
                    message: "email is already exist enter valid  email"
                });
            }
            newObj.email = email;
        }

        if (phone) {
            if (!isValid(phone)) {
                return res.status(400).send({
                    status: false,
                    message: "invalid phone"
                });
            }
            if (!isValidMobile(phone)) {
                return res.status(400).send({
                    status: false,
                    message: "phone is not valid"
                });
            }

            const isPhoneExist = await User.findOne({
                phone: phone
            })
            if (isPhoneExist) {
                return res.status(400).send({
                    status: false,
                    message: "phone no. is already exist enter valid  phone no."
                });
            }
            newObj.phone = phone;
        }

        if (password) {
            if (!isValid(password)) {
                return res.status(400).send({
                    status: false,
                    message: "invalid password"
                });
            }
            if (!isValidPassword(password)) {
                return res.status(400).send({ 
                    status: false, 
                    message: "password is not valid" 
                });
            }
            newObj.password = password;
        }

        if (address) {
            if (typeof (address) !== 'object') {
                return res.status(400).send({ 
                    status: false, 
                    message: "invalid address" 
                });
            }
            let { shipping, billing } = address;
            if (shipping) {
                if (typeof (shipping) !== 'object') {
                    return res.status(400).send({ 
                        status: false, 
                        message: "invalid shipping type" 
                    });
                }
                let { street, city, pincode } = shipping;
                if (street) {
                    if (!isValid(street)) {
                        return res.status(400).send({ 
                            status: false, 
                            message: "invalid shipping street" 
                        });
                    }

                }

                if (city) {
                    if (!isValid(city)) {
                        return res.status(400).send({ 
                            status: false, 
                            message: "invalid shipping city" 
                        });
                    }

                }

                if (pincode) {
                    if (!isValidPincode(pincode)) {
                        return res.status(400).send({ 
                            status: false, 
                            message: "invalid shipping pincode" 
                        });
                    }

                }
            }

            if (billing) {
                if (typeof (billing) !== 'object') {
                    return res.status(400).send({ 
                        status: false, 
                        message: "invalid billing type" 
                    });
                }
                let { street, city, pincode } = billing;
                if (street) {
                    if (!isValid(street)) {
                        return res.status(400).send({ 
                            status: false, 
                            message: "invalid billing street" 
                        });
                    }

                }

                if (city) {
                    if (!isValid(city)) {
                        return res.status(400).send({ 
                            status: false, 
                            message: "invalid billing city" 
                        });
                    }

                }

                if (pincode) {
                    if (!isValidPincode(pincode)) {
                        return res.status(400).send({ 
                            status: false, 
                            message: "invalid billing pincode" 
                        });
                    }

                }
            }
            newObj.address = address
        }
        let files = req.files;
        if (files && files.length > 0) {
            if (!isValid(files)) {
                return res.status(400).send({ 
                    status: false, 
                    message: " file not found" 
                });
            }
            let uploadFileURL = await uploadFile(files[0]);

            newObj.profileImage = uploadFileURL;
        }

        //update data

        const updateData = await User.findOneAndUpdate({ _id: userId }, newObj, { new: true });
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

module.exports = { userRegister, userLogin, getUser, updateUser };