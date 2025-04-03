const jwt = require('jsonwebtoken');
require("dotenv").config();
const secretKey = `${process.env.SECRET_KEY}`;

// Middleware để xử lý yêu cầu đăng nhập và kiểm tra JWT
module.exports = function authenticateJWT(req, res, next) {
    const token = req.cookies.Authentication;
    if (!token) {
        return res.redirect('/auth/login');
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.redirect('/auth/login');
        }
        req.user = user;
        res.locals.user = user;
        next();
    });
}

