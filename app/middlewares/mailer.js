const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'phonestorescb@gmail.com', // Điền email của bạn
    pass: 'htzp nxkl zggt oqpn', // Điền mật khẩu của bạn
  },
});

module.exports = transporter;
