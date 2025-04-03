module.exports = (tokenWithExpiration, miss, allow) => {
    // Tách mã ngẫu nhiên và thời gian hết hạn từ liên kết
    const [randomToken, expirationTime] = tokenWithExpiration.split('-');

    // Chuyển đổi thời gian hết hạn từ chuỗi thành đối tượng Date
    const expirationDate = new Date(parseInt(expirationTime));

    // Kiểm tra nếu thời gian hiện tại vượt quá thời gian hết hạn
    if (new Date() > expirationDate) {
        // Liên kết đã hết hạnf
        // Xử lý tương ứng, ví dụ: trả về thông báo lỗi
        miss();
    } else {
        // Liên kết còn hiệu lực
        // Xử lý tương ứng, ví dụ: cho phép người dùng truy cập
        allow();
    }
}