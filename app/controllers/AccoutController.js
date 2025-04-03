const bcrypt = require('bcrypt');
require("dotenv").config();
const tokenExpiration = require("../middlewares/randomTokenExpiration");
const transporter = require('../middlewares/mailer');
const saltRounds = + (process.env.SALT_ROUNDS);

const User = require('../models/User');
const { default: mongoose } = require('mongoose');
const Response = require('../api/response/response');
const { ObjectId } = require('mongodb');
const path = require('path');


class AccountController {

    getAll(req, res, next) {
        const searchKey = req.query.searchKey;
        const pageSize = parseInt(req.query.pageSize) || 7;
        const pageNumber = parseInt(req.query.pageNumber) || 1;
        let totalUsersCount;

        // Xây dựng điều kiện tìm kiếm
        const filter = {
            // role: { $ne: 'admin' } // Chỉ lấy các sản phẩm có role != 'Admin'
        };

        if (searchKey) {
            filter.$or = [
                { name: { $regex: searchKey, $options: 'i' } },
                { username: { $regex: searchKey, $options: 'i' } },
                { email: { $regex: searchKey, $options: 'i' } }
            ];
        }

        // Define the search condition based on the searchKey
        const searchCondition = searchKey ? filter : { };

        User.countDocuments(searchCondition)
            .then(count => {
                totalUsersCount = count;

                // Modify the query to include the search condition
                return User.find(searchCondition)
                    .skip((pageNumber - 1) * pageSize)
                    .limit(pageSize)
                    .lean();
            })
            .then(users => {
                const totalPages = Math.ceil(totalUsersCount / pageSize);

                res.render('pages/account/show', {
                    layout: "adminLayout",
                    option: 5,
                    users: users,
                    pageSize: 7,
                    pageNumber,
                    pageTotal: totalPages
                });
            })
            .catch(error => {
                console.error('Error during search:', error);
                next(error);
            });
    }


    // //[GET] /api/user/panigation?pageSize=&pageNumber=
    // getAllByPanigation(req, res, next) {
    //     const pageSize = parseInt(req.query.pageSize) || 7; // Default pageSize is 7
    //     const pageNumber = parseInt(req.query.pageNumber) || 1; // Default pageNumber is 1

    //     let totalUsersCount;

    //     User.countDocuments({ role: "staff" })
    //         .then(count => {
    //             totalUsersCount = count;

    //             return User.find({ role: "staff" })
    //                 .skip((pageNumber - 1) * pageSize)
    //                 .limit(pageSize)
    //                 .lean();
    //         })
    //         .then(users => {
    //             const totalPages = Math.ceil(totalUsersCount / pageSize);

    //             const response = new Response(true, "Success", users, pageSize, pageNumber, totalPages);
    //             res.json(response);
    //         })
    //         .catch(error => {  // Change 'next' to 'error' in this line
    //             console.error("Error in getAllByPanigation:", error);
    //             const response = new Response(false, "Error", null);
    //             res.status(500).json(response);
    //         });
    // }

    showAdd(req, res, next) {
        res.render('pages/account/add', { layout: "adminLayout", option: 5 });
    }

    //[POST] /account-management/add
    add(req, res, next) {
        const { name, email } = req.body;
        const username = email.split('@')[0];
        const password = username;
        User.findOne({ email }).lean()
            .then(user => {
                if (user) {
                    req.session.flash = {
                        type: 'danger',
                        title: "Thông báo",
                        message: "Email đã tồn tại tài khoản"
                    }
                    return res.redirect('back');
                }
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if (err) {
                        req.session.flash = {
                            type: 'danger',
                            title: "Thông báo",
                            message: "Có lỗi xãy ra " + err.message
                        }
                        // console.log('error err.message :>> ', err.message);
                        return res.redirect('back');
                    } else {
                        const tokenWithExpire = tokenExpiration();
                        const newUser = new User({ name, email, username, password: hash, roles: 'staff', status: 'pending', tokenWithExpiration: tokenWithExpire });
                        newUser.save()
                            .then(() => {
                                //send mail with tokenWithExpires
                                const mailOptions = {
                                    from: 'phonestore@gmail.com', // Địa chỉ email gửi
                                    to: email, // Địa chỉ email nhận
                                    subject: 'Thông báo tạo tài khoản',
                                    text: 'Bạn đã được tạo tài khoản. Vui lòng sử dụng liên kết sau để đăng nhập trong vòng 1 phút:',
                                    html: `
                                      <p>
                                        Xin chào, ${name}
                                      </p>
                                      <p>
                                        Bạn đã được tạo tài khoản. Vui lòng sử dụng liên kết dưới đây để đăng nhập trong vòng 1 phút:
                                      </p>
                                      <a href="http://localhost:8080/auth/verify/${tokenWithExpire}">Click here to login</a>
                                      <p>
                                        Trân trọng,
                                        <br>
                                        Phone Store SCB
                                      </p>
                                    `
                                };


                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        // console.log('Error sending email:', error);
                                        req.session.flash = {
                                            type: 'danger',
                                            title: "Thông báo",
                                            message: "Đăng ký tài khoản thất bại do gửi mail."
                                        }
                                        return res.redirect('/admin/account-management');
                                    } else {
                                        // console.log('Email sent: ' + info.response);
                                        req.session.flash = {
                                            type: 'success',
                                            title: "Thông báo",
                                            message: "Đăng ký tài khoản thành công"
                                        }
                                        return res.redirect('/admin/account-management');
                                    }
                                });
                            })
                            .catch((e) => {
                                req.session.flash = {
                                    type: 'danger',
                                    title: "Thông báo",
                                    message: "Đăng ký tài khoản thất bại" + e.message
                                }
                                return res.redirect('/admin/account-management');
                            });
                    }
                });

            })
            .catch(() => {
                req.session.flash = {
                    type: 'danger',
                    title: "Thông báo",
                    message: "Có lỗi xãy ra"
                }
                return res.redirect('back')
            });
    }

    //[POST] /account-management/send
    sendMail(req, res, next) {
        const { _id, email } = req.body;
        const id = new mongoose.Types.ObjectId(_id);
        User.findOne({ _id: id }).lean()
            .then(user => {
                if (!user) {
                    return res.json({ success: false, message: "Not found user" });
                }
                //send mail
                const tokenWithExpire = tokenExpiration();
                User.updateOne({ _id: id }, { tokenWithExpiration: tokenWithExpire })
                    .then(() => {
                        const mailOptions = {
                            from: 'phonestore@gmail.com', // Địa chỉ email gửi
                            to: email, // Địa chỉ email nhận
                            subject: 'Thông báo tạo tài khoản',
                            text: 'Bạn đã được tạo tài khoản. Vui lòng sử dụng liên kết sau để đăng nhập trong vòng 1 phút:',
                            html: `
                                      <p>
                                        Xin chào, ${user.name}
                                      </p>
                                      <p>
                                        Bạn đã được tạo tài khoản. Vui lòng sử dụng liên kết dưới đây để đăng nhập trong vòng 1 phút:
                                      </p>
                                      <a href="http://localhost:8080/auth/verify/${tokenWithExpire}">Click here to login</a>
                                      <p>
                                        Trân trọng,
                                        <br>
                                        Phone Store SCB
                                      </p>
                                    `
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return res.json({ success: false, message: "Send faild", error: error });
                            } else {
                                return res.json({ success: true, message: "Send success", info: info });
                            }
                        });
                    })
                    .catch(e => res.json({ success: false, message: "Update token faild", error: e }));
            })
            .catch((err) => res.json({ success: false, message: "error find", error: err.message }));
    }

    //[PUT] /account-management/locked/:id
    locked(req, res, next) {
        const id = req.params.id;
        const { _id, role } = req.user;
        if (role !== 'admin') {
            return res.json(new Response(false,'Bạn không đủ quyền sử dụng chức năng này.', _id ));
        }
        else if (id === _id) {
            return res.json(new Response(false,'Bạn không thể khóa chính mình.', _id ));
        }
        User.findOne({ _id }).lean()
            .then(user => {
                if (!user) {
                    return res.json(new Response(false,'Không tìm thấy người dùng này.', _id ));
                }
                User.updateOne({ _id: id }, { status: 'locked' })
                    .then(user => res.json(new Response(true, 'Khóa tài khoản thành công', user )))
                    .catch(next);
            })
            .catch(e => {
                return res.status(400).json(new Response(false,'Error Server 500', _id ));
            });
    }

    //[PUT] /account-management/unlocked/:id
    unLocked(req, res, next) {
        const id = req.params.id;
        const { _id, role } = req.user;
        if (role !== 'admin') {
            return res.json(new Response(false,'Bạn không đủ quyền sử dụng chức năng này.', _id ));
        }

        User.findOne({ _id: id }).lean()
            .then(user => {
                if (!user) {
                    return res.json(new Response(false,'Không tìm thấy người dùng này.', _id ));
                }
                User.updateOne({ _id: id }, { status: 'active' })
                    .then(user => res.json(new Response(true, 'Mở khóa tài khoản thành công', user )))
                    .catch(next);
            })
            .catch(e => {
                return res.status(400).json(new Response(false,'Error Server 500', _id ));
            });
    }

    openAccount(req, res, next) {
        const _id = req.params.id;
        User.findOne({ _id }).lean()
            .then(user => {
                User.updateOne({ _id }, { status: 'active' })
                    .then(user => res.json({ success: true, message: 'Mở tài khoản thành công', data: user }))
                    .catch(next);
            })
            .catch(e => {
                return res.status(400).json({ status: false, message: "Server error" });
            });
    }

    //[POST] api/user/edit/name
    editName(req, res, next) {
        const _id = req.user._id;
        const name = req.body.name;

        if (!ObjectId.isValid(_id)) {
            return res.status(404).json(new Response(false, 'Không xác định được id ' + id, null));
        }

        if (!name) {
            return res.status(400).json(new Response(false, 'Tên không được để trống', null));
        }

        User.findOneAndUpdate({ _id }, { name }, { new: true })
            .lean()
            .then(updatedUser => {
                if (!updatedUser) {
                    return res.status(404).json(new Response(false, 'Người dùng không tồn tại', null));
                }

                res.status(200).json(new Response(true, 'Cập nhật tên thành công', updatedUser));
            })
            .catch(e => res.status(500).json(new Response(false, 'Lỗi server', e)));
    }

    //[POST] api/user/edit/avatar
    editAvatar(req, res, next) {
        const image = req.file.filename;
        const _id = req.user._id;

        if (!ObjectId.isValid(_id)) {
            return res.status(404).json(new Response(false, 'Không xác định được id ' + id, null));
        }

        if (!image) {
            return res.status(400).json(new Response(false, 'Ảnh không được để trống', null));
        }

        User.findOneAndUpdate({ _id }, { image }, { new: true })
            .lean()
            .then(updatedUser => {
                if (!updatedUser) {
                    return res.status(404).json(new Response(false, 'Người dùng không tồn tại', null));
                }

                res.status(200).json(new Response(true, 'Cập nhật ảnh đại diện thành công', updatedUser));
            })
            .catch(e => res.status(500).json(new Response(false, 'Cập nhật ảnh đại diện thất bại', e)));

    }

    //[GET] /api/image/:filename
    getImage(req, res, next) {
        const filename = req.params.filename;

        const uploadsPath = path.resolve(__dirname, '..', '..', 'uploads');

        const filePath = path.join(uploadsPath, filename);

        res.sendFile(filePath, (err) => {
            if (err) {
                console.error(err);
                res.status(404).send('Image not found');
            }
        });
    }

    //[POST] api/user/edit/phone
    editPhone(req, res, next) {
        const _id = req.user._id;
        const phoneNumber = req.body.phoneNumber;

        if (!ObjectId.isValid(_id)) {
            return res.status(404).json(new Response(false, 'Không xác định được id ' + id, null));
        }

        if (!phoneNumber) {
            return res.status(400).json(new Response(false, 'Số điện thoại không được để trống', null));
        }

        User.findOneAndUpdate({ _id }, { phoneNumber }, { new: true })
            .lean()
            .then(updatedUser => {
                if (!updatedUser) {
                    return res.status(404).json(new Response(false, 'Người dùng không tồn tại', null));
                }

                res.status(200).json(new Response(true, 'Cập nhật số điện thoại thành công', updatedUser));
            })
            .catch(e => res.status(500).json(new Response(false, 'Cập nhật số điện thoại thất bại', e)));
    }

    //[POST] api/user/edit/phone
    editFacebookUrl(req, res, next) {
        const _id = req.user._id;
        const facebookUrl = req.body.facebookUrl;

        if (!ObjectId.isValid(_id)) {
            return res.status(404).json(new Response(false, 'Không xác định được id ' + id, null));
        }

        if (!facebookUrl) {
            return res.status(400).json(new Response(false, 'link Facebook không được để trống', null));
        }

        User.findOneAndUpdate({ _id }, { facebookUrl }, { new: true })
            .lean()
            .then(updatedUser => {
                if (!updatedUser) {
                    return res.status(404).json(new Response(false, 'Người dùng không tồn tại', null));
                }

                res.status(200).json(new Response(true, 'Cập nhật link Facebook thành công', updatedUser));
            })
            .catch(e => res.status(500).json(new Response(false, 'Cập nhật link Facebook thất bại', e)));
    }

    editInstagramUrl(req, res, next) {
        const _id = req.user._id;
        const instagramUrl = req.body.instagramUrl;

        if (!ObjectId.isValid(_id)) {
            return res.status(404).json(new Response(false, 'Không xác định được id ' + id, null));
        }

        if (!instagramUrl) {
            return res.status(400).json(new Response(false, 'link Instagram không được để trống', null));
        }

        User.findOneAndUpdate({ _id }, { instagramUrl }, { new: true })
            .lean()
            .then(updatedUser => {
                if (!updatedUser) {
                    return res.status(404).json(new Response(false, 'Người dùng không tồn tại', null));
                }

                res.status(200).json(new Response(true, 'Cập nhật link Instagram thành công', updatedUser));
            })
            .catch(e => res.status(500).json(new Response(false, 'Cập nhật link Instagram thất bại', e)));
    }
}

module.exports = new AccountController();