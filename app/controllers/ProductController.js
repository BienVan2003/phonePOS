const Product = require('../models/Product');
const Order = require('../models/Order')
const { validationResult } = require('express-validator');

class ProductController {

    async showProductPage(req, res) {
        return res.render('pages/product/list', {
            layout: "adminlayout",
            option: 3
        });
    }

    showAddPage(req, res) {
        return res.render('pages/product/add', { layout: "adminlayout", option: 3 });
    }

    async showEditPage(req, res) {
        try {
            // Lấy dữ liệu từ biểu mẫu
            const id = req.params.id;
            // Tìm sản phẩm dựa trên _id
            const product = await Product.findById(id).lean();
            return res.render('pages/product/edit', { layout: "adminlayout", option: 3, product });
        } catch (err) {
            console.error(err);
            return res.status(400).json({
                message: 'Lỗi!'
            });
        }

    }

    async showDetailPage(req, res) {
        try {
            // Lấy dữ liệu từ biểu mẫu
            const id = req.params.id;
            // Tìm sản phẩm dựa trên _id
            const product = await Product.findById(id).lean();
            return res.render('pages/product/detail', { layout: "adminlayout", option: 3, product });
        } catch (err) {
            console.error(err);
            return res.status(400).json({
                message: 'Lỗi!'
            });
        }

    }

    async getProductList(req, res, next) {
        const page = req.query.page;
        const PAGE_SIZE = 10;

        try {
            const totalPages = await Product.countDocuments({ isDeleted: { $ne: true } });
            if (page) {
                const skip = (parseInt(page) - 1) * PAGE_SIZE;
                const products = await Product.find({ isDeleted: { $ne: true } }).skip(skip).limit(PAGE_SIZE).lean();
                return res.status(200).json({
                    totalPages: Math.ceil(totalPages / PAGE_SIZE),
                    total: totalPages,
                    data: products
                });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi trong quá trình xử lý yêu cầu.' });
        }
    }

    async getById(req, res) {
        try {
            // Lấy dữ liệu từ biểu mẫu
            const id = req.params.id;
            // Tìm sản phẩm dựa trên _id
            const product = await Product.findById(id);

            return res.status(200).json({
                message: 'Đã tìm thấy sản phẩm!',
                data: product
            });
        } catch (err) {
            console.error(err);
            return res.status(400).json({
                message: 'Lỗi!'
            });
        }
    }

    async getAll(req, res) {
        try {
            const products = await Product.find({ isDeleted: { $ne: true } }).lean();
            return res.status(200).json(products
            );
        } catch (error) {
            return res.status(500).json({ error: 'Lỗi trong quá trình xử lý yêu cầu.' });
        }
    }


    async filter(req, res) {
        try {
            const { productName, category, brand } = req.query;

            // Xây dựng điều kiện tìm kiếm
            const filter = {
                isDeleted: { $ne: true } // Chỉ lấy các sản phẩm có isDeleted khác true
            };

            if (productName) {
                filter.$or = [];
                filter.$or.push({ productName: { $regex: productName, $options: 'i' } });
                filter.$or.push({ barcode: { $regex: productName, $options: 'i' } });
            } else if (category) {
                filter.$or = [];
                filter.$or.push({ category: { $regex: category, $options: 'i' } });
            } else if (brand) {
                filter.$or = [];
                filter.$or.push({ brand: { $regex: brand, $options: 'i' } });
            }

            // Thực hiện truy vấn MongoDB
            const products = await Product.find(filter);

            return res.json(products);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // POST
    async addProduct(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { barcode, productName, importPrice, retailPrice, category } = req.body;

            try {
                const product = await Product.findOne({ barcode }).lean();
                if (product) {
                    return res.json({
                        status: false,
                        message: 'Mã vạch đã tồn tại!'
                    });
                } else {
                    const newProduct = new Product({ barcode, productName, importPrice, retailPrice, category });
                    console.log(newProduct)
                    await newProduct.save();
                    return res.json({
                        status: true,
                        message: 'Thêm sản phẩm thành công!',
                        data: newProduct
                    });
                }
            } catch (error) {
                return res.json({
                    status: false,
                    message: 'Thêm sản phẩm thất bại!'
                });
            }
        }
        else {
            const errors = result.array()
            const firstErrorMessage = errors[0].msg;

            return res.json({
                status: false,
                message: firstErrorMessage
            });
        }
    }


    // PUT
    async editProduct(req, res) {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            try {
                // Lấy dữ liệu từ biểu mẫu
                const { _id, barcode, productName, importPrice, retailPrice, category } = req.body;

                // Tìm sản phẩm dựa trên _id
                const product = await Product.findById(_id);

                if (!product) {
                    return res.status(202).json({
                        status: false,
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
                        status: true,
                        message: 'Sản phẩm đã được cập nhật thành công!'
                    });
                }
            } catch (err) {
                console.error(err);
                return res.status(400).json({
                    status: false,
                    message: 'Lỗi trong quá trình cập nhật sản phẩm!'
                });
            }
        }
        else {
            const errors = result.array()
            const firstErrorMessage = errors[0].msg;

            return res.status(400).json({
                status: false,
                message: firstErrorMessage
            });
        }
    }

    // DELETE
    async deleteProduct(req, res) {
        const productId = req.params.id;

        Product.findByIdAndUpdate(productId, { isDeleted: true })
            .then((product) => {

                if (!product) {
                    return res.status(400).json({
                        status: false,
                        message: 'Không tìm thấy sản phẩm'
                    });
                }
                return res.status(200).json({
                    status: true,
                    message: 'Sản phẩm đã bị xóa thành công'
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    status: false,
                    message: 'Lỗi trong quá trình xóa sản phẩm ' + err
                });
            });
    }

}

module.exports = new ProductController();