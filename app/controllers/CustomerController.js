const Customer = require('../models/Customer');
const Order = require('../models/Order')
const { validationResult } = require('express-validator');

class CustomerController {
  async showCustomerPage(req, res) {
    return res.render('pages/customer/list', { layout: "adminlayout", option: 4 });
  }

  async showDetailPage(req, res) {
    try {
      // Lấy dữ liệu từ biểu mẫu
      const id = req.params.id;
      // Tìm sản phẩm dựa trên _id
      const customer = await Customer.findById(id).lean();
      const orders = await Order.find({ customer: customer._id }).lean();
      // console.log(orders)
      return res.render('pages/customer/detail', { layout: "adminlayout", option: 4, customer, orders });
    } catch (err) {
      console.error(err);
      return res.status(400).json({
        message: 'Lỗi!'
      });
    }
  }

  async filterByPhone(req, res) {
    try {
      const { phone } = req.query;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required in the query parameters.' });
      }

      const filter = {
        isDeleted: { $ne: true } // Chỉ lấy các sản phẩm có isDeleted khác true
      };
      filter.$or = [];
      filter.$or.push({ name: { $regex: phone, $options: 'i' } });
      filter.$or.push({ email: { $regex: phone, $options: 'i' } });
      filter.$or.push({ phone: { $regex: phone, $options: 'i' } });


      const customers = await Customer.find(filter);

      if (customers.length === 0) {
        return res.status(404).json({ error: 'No matching customers found.' });
      }

      res.json(customers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getCustomerList(req, res) {
    const page = req.query.page;
    const PAGE_SIZE = 10;

    try {
      const totalPages = await Customer.countDocuments({ isDeleted: { $ne: true } });
      if (page) {
        const skip = (parseInt(page) - 1) * PAGE_SIZE;
        const customers = await Customer.find({ isDeleted: { $ne: true } }).skip(skip).limit(PAGE_SIZE).lean();
        return res.status(200).json({
          totalPages: Math.ceil(totalPages / PAGE_SIZE),
          total: totalPages,
          data: customers
        });
      } else {
        const customers = await Customer.find({ isDeleted: { $ne: true } }).limit(PAGE_SIZE).lean();
        return res.status(200).json({
          totalPages: Math.ceil(totalPages / PAGE_SIZE),
          total: totalPages,
          data: customers
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Lỗi trong quá trình xử lý yêu cầu.' });
    }
  }

  // POST
  async addCustomer(req, res) {
    let result = validationResult(req);
    if (result.errors.length === 0) {
      const { name, email, phone, address } = req.body;
      try {
        const customer = await Customer.findOne({ phone }).lean();
        const customer2 = await Customer.findOne({ email }).lean();
        if (customer) {
          return resizeTo.json({
            status: false,
            message: 'Số điện thoại đã tồn tại!'
          });
        } else if (customer2) {
          return res.json({
            status: false,
            message: 'Email đã tồn tại!'
          });
        }
        else {
          const newCustomer = new Customer({ name, email, phone, address });
          await newCustomer.save();
          return res.json({
            status: true,
            message: 'Thêm khách hàng thành công!',
            data: newCustomer
          });
        }
      } catch (error) {
        return res.json({
          status: false,
          message: 'Thêm khách hàng thất bại!'
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
  async editCustomer(req, res) {
    let result = validationResult(req);
    if (result.errors.length === 0) {
      try {
        // Lấy dữ liệu từ biểu mẫu
        const { _id, name, email, phone, address } = req.body;

        // Tìm sản phẩm dựa trên _id
        const customer = await Customer.findById(_id);

        if (!customer) {
          return res.json({
            status: false,
            message: 'Không tìm thấy khách hàng!'
          });
        }

        if (customer) {
          // Cập nhật thông tin sản phẩm
          customer.name = name;
          customer.email = email;
          customer.phone = phone;
          customer.address = address;

          // Lưu sản phẩm đã cập nhật
          await customer.save();

          return res.json({
            status: true,
            message: 'Khách hàng đã được cập nhật thành công!'
          });
        }
      } catch (err) {
        console.error(err);
        return res.json({
          status: false,
          message: 'Lỗi trong quá trình cập nhật thông tin khách hàng!'
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

  // DELETE
  async deleteCustomer(req, res) {
    const customerId = req.params.id;

    Customer.findByIdAndUpdate(customerId, { isDeleted: true })
      .then((customer) => {
        if (!customer) {
          return res.json({
            status: false,
            message: 'Không tìm thấy khách hàng'
          });
        }
        return res.json({
          status: false,
          message: 'Khách hàng đã bị xóa đã bị xóa thành công'
        });
      })
      .catch((err) => {
        return res.json({
          status: false,
          message: 'Lỗi trong quá trình xóa sản phẩm ' + err
        });
      });
  }

}

module.exports = new CustomerController();
