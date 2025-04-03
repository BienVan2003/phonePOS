const Order = require('../models/Order');
const { validationResult } = require('express-validator');
const Response = require('../api/response/response');
const { ObjectId } = require('mongodb');

class OrderController {
    async getOrderList(req, res, next) {
        const page = req.query.page;
        const PAGE_SIZE = 10;

        try {
            const totalPages = await Order.countDocuments({ isDeleted: { $ne: true } });
            if (page) {
                const skip = (parseInt(page) - 1) * PAGE_SIZE;
                const orders = await Order.find({ isDeleted: { $ne: true } })
                    .skip(skip)
                    .limit(PAGE_SIZE)
                    .populate('products.product') // Populate thông tin sản phẩm nếu cần
                    .populate('customer') // Populate thông tin khách hàng
                    .lean();

                res.status(200).json({
                    totalPages: Math.ceil(totalPages / PAGE_SIZE),
                    total: totalPages,
                    data: orders
                });
            }
        } catch (error) {
            res.status(500).json({ error: 'Lỗi trong quá trình xử lý yêu cầu.' });
        }
    }


    //[GET] /api/order/user/{id}
    getOrderByUserId(req, res, next) {
        const seller = req.params.id;
        if(!seller || !ObjectId.isValid(seller)) return res.json(new Response(false, 'invalid id seller', null));

        Order.find({seller}).populate('customer').lean()
            .then(orders => res.json(new Response(true, 'Danh sách hóa đơn id= '+ seller + ' tạo.', orders)))
            .catch(next);
    }

    // POST
    async createOrder(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            try {
                const seller = req.user._id;
                const { totalAmount, products, customer, payment } = req.body;

                if (payment.changeAmount >= 0 && payment.paidAmount>0) {
                    const newOrder = new Order({ totalAmount, products, customer, seller, payment, createdDate: new Date().toLocaleString() });
                    const savedOrder = await newOrder.save();
                    return res.json({
                        status: true,
                        message: 'Thanh toán thành công',
                        data: savedOrder,
                    });
                } else {
                    return res.json({
                        status: false,
                        message: 'Tiền khách đưa không đủ để thanh toán'
                    });
                }
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } else {
            const errors = result.array()
            const firstErrorMessage = errors[0].msg;

            return res.json({
                status: false,
                message: firstErrorMessage
            });
        }
    }


    // PUT
    async editOrder(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            try {
                // Lấy dữ liệu từ biểu mẫu
                const { _id, barcode, productName, importPrice, retailPrice, category } = req.body;

                // Tìm sản phẩm dựa trên _id
                const product = await Product.findById(_id);

                if (!product) {
                    return res.status(202).json({
                        code: 1,
                        message: 'Không tìm thấy sản phẩm!'
                    });
                }

                if (product) {
                    // Cập nhật thông tin sản phẩm
                    product.barcode = barcode;
                    product.productName = productName;
                    product.importPrice = importPrice;
                    product.retailPrice = retailPrice;
                    product.category = category;

                    // Lưu sản phẩm đã cập nhật
                    await product.save();

                    return res.status(200).json({
                        message: 'Sản phẩm đã được cập nhật thành công!'
                    });
                }
            } catch (err) {
                console.error(err);
                return res.status(400).json({
                    message: 'Lỗi trong quá trình cập nhật sản phẩm!'
                });
            }
        }
        else {
            const errors = result.array()
            const firstErrorMessage = errors[0].msg;

            return res.status(400).json({
                message: firstErrorMessage
            });
        }
    }

    // DELETE
    async deleteOrder(req, res) {
        const productId = req.params.id;

        Product.findByIdAndUpdate(productId, { isDeleted: true })
            .then((product) => {
                if (!product) {
                    return res.status(400).json({
                        message: 'Không tìm thấy sản phẩm'
                    });
                }
                return res.status(200).json({
                    message: 'Sản phẩm đã bị xóa thành công'
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    message: 'Lỗi trong quá trình xóa sản phẩm ' + err
                });
            });
    }

    async invoice(req, res, next) {
        try {
            const id = req.params.id;
            // Tìm sản phẩm dựa trên _id
            const order = await Order.findById(id).populate('products.product').populate('customer').lean();
            if (order != null) {
                console.log(order)
                res.render('pages/invoice/index', { layout: "nolayout", order });
            }
        } catch (err) {
            console.error(err);
            return res.status(400).json({
                message: 'Lỗi!'
            });
        }
    }

}

module.exports = new OrderController();