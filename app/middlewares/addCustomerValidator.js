const {check} = require('express-validator')

module.exports = [
    check('name')
    .exists().withMessage('Please provide name')
    .notEmpty().withMessage('Name cannot be empty'),

    check('email')
    .isEmail().withMessage('Please enter the correct email format')
    .exists().withMessage('Please provide email')
    .notEmpty().withMessage('Email cannot be empty'),

    check('phone')
    .exists().withMessage('Please provide phone')
    .notEmpty().withMessage('Phone name cannot be empty'),


    check('address')
    .exists().withMessage('Please provide address')
    .notEmpty().withMessage('Address cannot be empty')
    
]