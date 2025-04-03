const crypto = require('crypto');

module.exports = function () {
    // Tạo mã ngẫu nhiên (ví dụ: mã dạng hex có 32 ký tự)
    const randomToken = crypto.randomBytes(16).toString('hex');

    // Tính thời gian hiện tại và thời gian hết hạn (1 phút sau)
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 60 * 1000); // 60,000 milliseconds = 1 phút

    // Kết hợp mã ngẫu nhiên và thời gian hết hạn để tạo liên kết
    return `${randomToken}-${expirationTime.getTime()}`;
}