const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'staff' },
    status: { type: String, default: 'pending' },
    image: { type: String, required: false, default: 'user.png' },
    phoneNumber: { type: String, required: false, default:'Chưa cập nhật' },
    facebookUrl: { type: String, required: false, default: '#' },
    instagramUrl: { type: String, required: false, default: '#' },
    isChangePassword: { type: Boolean, default: false },
    tokenWithExpiration: { type: String }
}, {
    timeseries: true
});
User.index({ name: 'text', username: 'text', email: 'text' });


module.exports = mongoose.model('User', User);
