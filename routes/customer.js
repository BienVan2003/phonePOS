const express = require('express');
const router = express.Router();

const customerController = require('../app/controllers/CustomerController');
const addCustomerValidator = require('../app/middlewares/addCustomerValidator');

router.get('/filter', customerController.filterByPhone);
router.get('/', customerController.getCustomerList);
router.post('/', addCustomerValidator, customerController.addCustomer);
router.put('/:id', addCustomerValidator, customerController.editCustomer);
router.delete('/:id', customerController.deleteCustomer);



module.exports = router;
