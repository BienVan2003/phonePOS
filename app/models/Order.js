const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Order = new Schema({
    totalAmount: { type: Number },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number },
            total: { type: Number },
        }
    ],
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payment: {
        paidAmount: { type: Number },
        changeAmount: { type: Number },
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('Order', Order);

// paidAmount: Số tiền mà khách hàng đưa ra để thanh toán đơn hàng.
// changeAmount: Số tiền khách hàng nhận lại (thường được tính bằng paidAmount - totalAmount).
