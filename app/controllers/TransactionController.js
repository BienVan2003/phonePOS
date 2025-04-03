const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');

class TransactionController {
    async showTransactionPage(req, res) {
        return res.render('pages/transaction/index', { layout: "adminlayout", option: 1 });
    }
}

module.exports = new TransactionController();
