const Order = require('../models/Order');

class ReportController {
    async showReportPage(req, res) {
        try {
            let { date, fromDate, toDate } = req.query;

            let query = {};
            let follow = '';

            const getCurrentDate = () => new Date().toDateString();
            const getYesterday = () => new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();
            const getLast7Days = () => new Date(new Date().setDate(new Date().getDate() - 7)).toDateString();
            const getFirstDayOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toDateString();

            if (date) {
                switch (date) {
                    case 'yesterday':
                        query.createdDate = { $gte: getYesterday(), $lte: getCurrentDate() };
                        follow = 'Xem thống kê sản phẩm đã được bán của ngày hôm qua';
                        break;
                    case 'today':
                        query.createdDate = { $gte: getCurrentDate() };
                        follow = 'Xem thống kê sản phẩm đã được bán của hôm nay';
                        break;
                    case 'last7Days':
                        query.createdDate = { $gte: getLast7Days() };
                        follow = 'Xem thống kê sản phẩm đã được bán của 7 ngày gần đây';
                        break;
                    case 'thisMonth':
                        query.createdDate = { $gte: getFirstDayOfMonth() };
                        follow = 'Xem thống kê sản phẩm đã được bán của tháng này';
                        break;
                    default:
                        break;
                }
            } else if (fromDate && toDate) {
                let tmp = new Date(toDate);
                tmp.setHours(23, 59, 59, 999);
                query.createdDate = { $gte: fromDate, $lte: tmp };
                follow = `Xem thống kê sản phẩm đã được bán từ ${fromDate} tới ${toDate}`;
            } else if (toDate) {
                let tmp = new Date(toDate);
                tmp.setHours(23, 59, 59, 999);
                query.createdDate = { $lte: tmp };
                follow = `Xem thống kê sản phẩm đã được bán tới ${toDate}`;
            }

            // console.log(query)
            const orders = await Order.find(query).populate('products.product').populate('customer').populate('seller').lean();

            // Đối tượng để lưu thông tin thống kê
            const productStats = {};

            // Lặp qua các đơn hàng
            orders.forEach(order => {
                // Lặp qua sản phẩm trong đơn hàng
                order.products.forEach(productItem => {
                    const productId = productItem.product._id;
                    const quantity = productItem.quantity;

                    // Kiểm tra xem sản phẩm đã tồn tại trong thông tin thống kê chưa
                    if (productStats[productId]) {
                        // Nếu sản phẩm đã tồn tại, tăng số lượng
                        productStats[productId].quantity += quantity;
                    } else {
                        // Nếu sản phẩm chưa tồn tại, thêm vào thông tin thống kê
                        productStats[productId] = {
                            productName: productItem.product.productName, // tùy thuộc vào cấu trúc của sản phẩm
                            quantity: quantity,
                        };
                    }
                });
            });

            // Kết quả là một mảng chứa thông tin thống kê
            // const productStatsArray = Object.values(productStats);
            // console.log(productStats);

            // Tính toán Total Amount Received, Number of Orders, Number of Products
            const totalAmountReceived = orders.reduce((acc, order) => acc + order.totalAmount, 0);
            const numberOfOrders = orders.length;
            const numberOfProducts = orders.reduce((acc, order) => acc + order.products.length, 0);

            return res.render('pages/report/index', {
                layout: "adminlayout", option: 6, orders, totalAmountReceived,
                numberOfOrders,
                numberOfProducts,
                follow,
                productStats
            });

        } catch (error) {
            // console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async getOrderStatistics(query) {
        const orders = await Order.find(query);
        const totalAmount = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalOrders = orders.length;

        return {
            totalAmount,
            totalOrders,
        };
    }
}

module.exports = new ReportController();
