const router = require('express').Router();
const {userRegister, userLogin, getUser, updateUser} = require('../controller/userController');
const {authentication, authorization} = require('../middleware/middleware');
const {createProduct, getProduct, getProductById, updateProduct, deleteProduct} = require('../controller/productController');
const {createCart, getCart, updateCart, deleteCart} = require('../controller/cartController');
const{createModel, updateModel} = require('../controller/orderController')
//==================================== User ============================================//
router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/user/:userId/profile', authentication, authorization, getUser);
router.put('/user/:userId/profile', authentication, authorization, updateUser);

//==================================== product ============================================//
router.post('/products', createProduct);
router.get('/products',getProduct);
router.get('/products/:productId', getProductById);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);

//==================================== cart ============================================//
router.post('/users/:userId/cart', authentication, authorization, createCart);
router.put('/users/:userId/cart', authentication, authorization, updateCart);
router.get('/users/:userId/cart', authentication, authorization, getCart);
router.delete('/users/:userId/cart', authentication, authorization, deleteCart);

//==================================== cart ============================================//

router.post('/users/:userId/orders', authentication, authorization, createModel);
router.put('/users/:userId/orders', authentication, authorization, updateModel);

module.exports = router;