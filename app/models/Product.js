const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Product = new Schema({
    barcode: {
        type: String,
        required: true,
        unique: true,
    },
    productName: {
        type: String,
        required: true,
    },
    importPrice: {
        type: Number,
        required: true,
    },
    retailPrice: {
        type: Number,
        required: true,
    },
    image: {
        type: String
    },
    category: {
        type: String
    },
    brand: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    isDeleted: { type: Boolean, default: false },
})

module.exports = mongoose.model('Product', Product)