const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const handleLinkLoginRequest = require("../middlewares/handleLinkLoginRequest");
require("dotenv").config();
const secretKey = process.env.SECRET_KEY;
const saltRounds = + (process.env.SALT_ROUNDS);
const Response = require('../api/response/response');

const User = require('../models/User');
const { ObjectId } = require('mongoose').Types;

class AuthController {
    //[Get] /
    index(req, res, next) {
        res.render('home', { layout: 'main', user: req.user });
    };

    //[GET] /login
    showLogin(req, res) {
        res.render('pages/auth/login', { title: 'Đăng nhập', layout: 'authLayout' });
    };

    ///[GET] /auth/info/{id}
    showInfo(req, res, next) {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send('Invalid user ID');
        }

        User.findOne({ _id: id }).lean()
            .then(user => {
                res.render('pages/auth/info', { layout: 'authLayout', user });
            })
            .catch(next);
    }

    ///[GET] /auth/info/edit
    showEditInfoPage(req, res, next) {

        // console.log(req.user);
        res.render('pages/auth/edit', { layout: 'authLayout'});
        // const { id } = req.params;

        // if (!ObjectId.isValid(id)) {
        //     return res.status(400).send('Invalid user ID');
        // }

        // User.findOne({ _id: id }).lean()
        //     .then(user => {
        //         res.render('pages/auth/info', { layout: 'authLayout', user });
        //     })
        //     .catch(next);
    }

    //[GET] //api/auth/infojwt
    getUserByJWT(req, res, next) { 
        const id = req.user._id;
        if (!ObjectId.isValid(id)) {
            return res.status(404).json(new Response(false, 'Không xác định được id ' + id, null));
        }

        User.findOne({ _id: id }).lean()
            .then(user => {
                res.status(200).json(new Response(true, 'Thông tin người dùng', user));
            })
            .catch(e => res.status(500).json(new Response(false, 'Lỗi server' , e)));
    }

    //[GET] /auth/change-password
    showChangePassword(req, res, next) {
        res.render('pages/auth/change_password', { title: 'Đổi mật khẩu', layout: 'authLayout' });
    }

    //[POST] /auth/change-password
    async changePassword(req, res, next) {
        try {
            // console.log(req.user)
            const { password } = req.body;
            const _id = req.user._id;

            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Update the user's password in the database
            const updatedUser = await User.findByIdAndUpdate(
                _id,
                { password: hashedPassword, isChangePassword: true },
                { new: true }
            );

            if (!updatedUser) {
                req.session.flash = {
                    type: 'danger',
                    title: "Thông báo",
                    message: `Không tìm thấy tài khoản`
                }
                return res.redirect('back');
            }
            else {

                req.session.flash = {
                    type: 'success',
                    title: "Thành công",
                    message: `Đổi mật khẩu thành công.
                         Vui lòng đăng nhập lại.`
                }
                req.user = null;
                res.clearCookie('Authentication')
                return res.redirect('/auth/login');
            }

        }
        catch (err) { next(err); }
    }

    //[POST] /login
    login(req, res, next) {
        const { username, password } = req.body;
        User.findOne({ username }).lean()
            .then(user => {
                if (user) {
                    bcrypt.compare(password, user.password, (err, result) => {
                        if (result) {
                            if (user.status === 'pending') {
                                req.session.flash = {
                                    type: 'danger',
                                    title: "Thông báo",
                                    message: `Vui lòng đăng nhập bằng cách nhấp vào liên kết trong email của bạn`
                                }
                                return res.redirect('/auth/login');
                            }
                            else if (user.status === 'locked') {
                                req.session.flash = {
                                    type: 'danger',
                                    title: "Thông báo",
                                    message: `Tài khoản của bạn đã bị khóa`
                                }
                                // console.log(user);
                                return res.redirect('/auth/login');
                            }
                            const token = jwt.sign(user, secretKey, { expiresIn: "24h" });
                            res.cookie('Authentication', token, { httpOnly: true });
                            req.session.flash = {
                                type: 'success',
                                title: "Thông báo",
                                message: `Xin chào ${user.name}.`
                            }
                            return res.redirect('/admin/transaction');
                        } else {
                            req.session.flash = {
                                type: 'danger',
                                title: "Thông báo",
                                message: "Sai mật mật khẩu"
                            }
                            return res.redirect('/auth/login');
                        }
                    });
                }
                else {
                    req.session.flash = {
                        type: 'danger',
                        title: "Thông báo",
                        message: "Tài khoản không tồn tại"
                    }
                    return res.redirect('/auth/login');
                }
            })
            .catch(next);
    }

    //[GET] /logout
    logout(req, res) {
        req.user = null;
        res.clearCookie('Authentication')
        res.redirect('/auth/login');
    }

    verifyLogin(req, res, next) {
        const tokenWithExpiration = req.params.token;
        handleLinkLoginRequest(tokenWithExpiration, () => {
            return res.render('pages/auth/timeOutRequest', { message: "Yêu cầu quá hạn. Vui lòng liên hệ Admin để được hỗ trợ", titlePage: 'Yêu cầu đăng nhập', layout: 'authLayout' });
        }, () => {
            User.findOne({ tokenWithExpiration }).lean()
                .then(user => {
                    if (user) {
                        const token = jwt.sign(user, secretKey);
                        res.cookie('Authentication', token, { httpOnly: true });
                        //update user status 
                        User.updateOne({ _id: user._id }, { status: 'active' })
                            .then()
                            .catch(next);
                        return res.redirect('/admin/transaction');
                    }
                    else {
                        return res.render('pages/auth/timeOutRequest', { message: "Không tìm thấy thông tin", titlePage: 'Yêu cầu đăng nhập', layout: 'authLayout' });
                    }
                })
                .catch(next);
        })
    }
}

module.exports = new AuthController();