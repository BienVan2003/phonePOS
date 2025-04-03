const express = require('express');
const router = express.Router();

const productController = require('../app/controllers/ProductController');
const addProductValidator = require('../app/middlewares/addProductValidator');

//api
router.get('/filter', productController.filter)
router.get('/', productController.getProductList);
router.get('/:id', productController.getById);
router.post('/', addProductValidator, productController.addProduct);
router.put('/:id', addProductValidator, productController.editProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/all', productController.getAll);



module.exports = router;
