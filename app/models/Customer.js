const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Customer = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model('Customer', Customer);
