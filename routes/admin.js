const express = require('express');
const router = express.Router();

const productController = require('../app/controllers/ProductController');
const accountRouter = require('./account');
const customerController = require('../app/controllers/CustomerController');
const transactionController = require('../app/controllers/TransactionController');
const orderController = require('../app/controllers/OrderController');
const reportController = require('../app/controllers/ReportController');

router.get('/product-management', productController.showProductPage);
router.get('/product-management/add', productController.showAddPage);
router.get('/product-management/edit/:id', productController.showEditPage);
router.get('/product-management/detail/:id', productController.showDetailPage);
router.use('/account-management', accountRouter);
router.get('/customer-management', customerController.showCustomerPage);
router.get('/customer-management/detail/:id', customerController.showDetailPage);
router.get('/transaction', transactionController.showTransactionPage);
router.get('/invoice/:id', orderController.invoice);
router.get('/report', reportController.showReportPage);



module.exports = router;
