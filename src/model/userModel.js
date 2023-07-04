const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;
const { Schema, model } = mongoose;

const userSchema = new Schema({
    fname: { type: String, requrired: true, trim: true},
    lname: { type: String, requrired: true, trim: true},
    email: { type: String, requrired: true, unique: true, trim: true},
    profileImage: {type: String, requrired: true, trim: true},
    phone:{ type: String, requrired: true, unique: true, trim: true},
    password: {type: String, requrired: true, trim: true},
    address: {
        shipping: {
            street: {type: String, requrired: true, trim: true},
            city: {type: String, requrired: true, trim: true},
            pincode: {type: Number, requrired: true, trim: true},
        },
        billing: {
            street: {type: String, requrired: true, trim: true},
            city: {type: String, requrired: true, trim: true},
            pincode: {type: Number, requrired: true, trim: true},
        }
    },
}, {timestamps: true});

module.exports = model('User', userSchema);

