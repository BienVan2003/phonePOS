const {check} = require('express-validator')

module.exports = [
    check('barcode')
    .exists().withMessage('Please provide barcode')
    .notEmpty().withMessage('Barcode cannot be empty'),

    check('productName')
    .exists().withMessage('Please provide product name')
    .notEmpty().withMessage('Product name cannot be empty'),

    check('importPrice')
    .exists().withMessage('Please provide product import price')
    .notEmpty().withMessage('Product import price cannot be empty')
    .isNumeric().withMessage('Price must be a number type'),

    check('retailPrice')
    .exists().withMessage('Please provide product retail price')
    .notEmpty().withMessage('Product retail price cannot be empty')
    .isNumeric().withMessage('Price must be a number type'),

    check('category')
    .exists().withMessage('Please provide category')
    .notEmpty().withMessage('Category cannot be empty')
    
]