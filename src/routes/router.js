const router = require('express').Router();
const {userRegister, userLogin, getUser, updateUser} = require('../controller/userController');
const {authentication, authorization} = require('../middleware/middleware');
router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/user/:userId/profile', authentication, authorization, getUser);
router.put('/user/:userId/profile', authentication, authorization, updateUser);
module.exports = router;