const express = require('express');
const router = express.Router();

const orderController = require('../app/controllers/OrderController');
const addOrderValidator = require('../app/middlewares/addOrderValidator');

//api

router.get('/user/:id', orderController.getOrderByUserId);
router.get('/', orderController.getOrderList);
// router.get('/:id', orderController.getById);
router.post('/', addOrderValidator, orderController.createOrder);
// router.put('/:id', productController.editProduct);
// router.delete('/:id', productController.deleteProduct);




module.exports = router;
