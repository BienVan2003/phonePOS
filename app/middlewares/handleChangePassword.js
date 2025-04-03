
module.exports = handleChangePassword = (req, res, next) => {
    // console.log(req.user)
    if (req.user.isChangePassword === false) {
        req.session.flash = {
            type: 'danger',
            title: "Thông báo ",
            message: "Vui lòng đổi mật khẩu để sử dụng ứng dụng"
        }
        res.redirect('/auth/change-password');
    }
    next();
}