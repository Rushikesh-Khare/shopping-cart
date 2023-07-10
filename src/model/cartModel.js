const { Schema, model, default: mongoose } = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new Schema({
    userId: {
        type: objectId,
        ref: 'User',
        required: true,
        unique: true,
        trim: true
    },
    items: [{
        productId: {
            type: objectId,
            ref: 'Product',
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            trim: true
        }
    }],
    totalPrice: {
        type: Number, 
        required: true,
        triem: true,
        Comment: "Holds total price of all the items in the cart"
    },
    totalItems: {
        type: Number, 
        required: true,
        triem: true,
        comment: "Holds total number of items in the cart"
    }
}, {timestamps: true});

module.exports = model('Cart', cartSchema);