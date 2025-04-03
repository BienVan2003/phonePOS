const { check } = require('express-validator')

module.exports = [

    check('totalAmount')
        .exists().withMessage('Vui lòng mua hàng để thanh toán')
        .notEmpty().withMessage('Tổng tiền không được để trống')
        .isNumeric().withMessage('Tổng tiền phải là kiểu số'),

    check('customer')
        .exists().withMessage('Vui lòng thêm khách hàng')
        .notEmpty().withMessage('Khách hàng không được để trống'),

    check('products')
        .exists().withMessage('Vui lòng thêm sản phẩm')
        .notEmpty().withMessage('Sản phẩm không được để trống'),

    check('payment')
        .exists().withMessage('Vui lòng thêm payment')
        .notEmpty().withMessage('Payment không được để trống')
]