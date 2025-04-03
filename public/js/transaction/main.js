$(document).ready(function () {
    const SERVER_URL = 'http://localhost:8080';
    let products = [
        // {
        //     product: [],
        //     quantity: 0,
        //     total: 0
        // }
    ]
    let customers = [
    ]
    let orderCustomer = {}
    let paidAmount = 0
    let changeAmount = 0
    let totalAmount = 0

    $('#btn-payment').on('click', function () {
        if (changeAmount >= 0) {
            let order = {
                totalAmount: 0,
                products: [],
                customer: {},
                payment: {}
            }

            order.totalAmount = totalAmount;
            order.products = products;
            order.customer = orderCustomer._id;
            order.payment = { paidAmount, changeAmount };
            console.log(order)
            console.log(orderCustomer)

            $.ajax({
                url: `/api/order`,
                method: 'POST',
                data: order,
                success: function (data, status, xhr) {
                    // Xử lý dữ liệu trả về từ API và hiển thị lên giao diện
                    if (data.status == true) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Đơn hàng đã xử lý thành công',
                            showConfirmButton: false,
                            timer: 1500
                        })
                        // Tự động chuyển hướng sau 3 giây
                        setTimeout(function () {
                            // Đường dẫn mới bạn muốn chuyển hướng đến
                            var newLocation = `${SERVER_URL}/admin/invoice/${data.data._id}`;
                            console.log(newLocation)
                            // Chuyển hướng đến trang mới
                            window.location.href = newLocation;
                        }, 2000); // 3000 milliseconds = 3 seconds
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: data.message,
                            showConfirmButton: false,
                            timer: 1500
                        })
                    }

                },
                error: function (xhr, status, error) {
                    console.error('Error searching products:', error);
                }
            });
        }else{
            Swal.fire({
                icon: 'warning',
                title: 'Vui lòng nhập đủ tiền',
                showConfirmButton: false,
                timer: 1500
            })
        }
    });

    // Sự kiện khi người dùng mouseenter vào ô nhập liệu
    $('.hoverable').on('mouseenter', function () {
        $('#productList').show();
    });
    $('.hoverable').on('mouseleave', function () {
        $('#productList').hide();
    });

    $(document).on('input', '#quantity', function () {

        let enteredValue = parseFloat($(this).val());

        // Kiểm tra nếu giá trị nhập vào là âm
        if (enteredValue < 0 || isNaN(enteredValue)) {
            $(this).val(1);
        }

        const productId = $(this).data('id');

        const existingProductIndex = products.findIndex(item => item.product._id === productId);
        products[existingProductIndex].quantity = parseInt($(this).val());
        products[existingProductIndex].total = products[existingProductIndex].quantity * products[existingProductIndex].product.retailPrice;
        console.log('Value changed:', products);
        $(`tr#${productId}`).find('td').eq(4).text(formatVND(products[existingProductIndex].total) + ' ₫');

        const grandTotal = products.reduce((acc, item) => acc + item.total, 0);
        totalAmount = grandTotal;
        $('#totalAmount').html(formatVND(grandTotal) + ' ₫')

        changeAmount = paidAmount - totalAmount;

        $('#changeAmount').html(formatVND(changeAmount)  + ' ₫');

    });

    $(document).on('click', '.product', function () {

        // Lấy giá trị của thuộc tính data-id
        const productId = $(this).data('id');
        // In ra thông báo hoặc thực hiện các thao tác khác dựa trên productId
        console.log('Bạn đã chọn sản phẩm có ID:', productId);
        $.ajax({
            url: `/api/product/${productId}`,
            method: 'GET',
            success: function (data) {
                // Kiểm tra xem sản phẩm đã tồn tại trong mảng products hay chưa
                const existingProductIndex = products.findIndex(item => item.product._id === productId);

                if (existingProductIndex !== -1) {
                    // Nếu sản phẩm đã tồn tại, tăng quantity và cập nhật tổng số tiền
                    products[existingProductIndex].quantity += 1;
                    products[existingProductIndex].total = products[existingProductIndex].quantity * data.data.retailPrice;
                } else {
                    // Nếu sản phẩm chưa tồn tại, thêm vào mảng products và tính tổng số tiền
                    const newProduct = {
                        product: data.data,
                        quantity: 1,
                        total: data.data.retailPrice, // Tổng số tiền ban đầu bằng giá bán lẻ của sản phẩm
                    };

                    products.push(newProduct);
                }

                // Tính tổng số tiền cho toàn bộ mảng products
                const grandTotal = products.reduce((acc, item) => acc + item.total, 0);

                // In ra mảng products và tổng số tiền để kiểm tra
                console.log('Mảng sản phẩm:', products);
                console.log('Tổng số tiền:', grandTotal);

                var productHtml = "";

                $.each(products, function (index, item) {
                    const product = item.product;
                    const quantity = item.quantity;
                    const total = item.total
                    productHtml += `
                        <tr id="${product._id}">
                            <td>${index + 1}</td>
                            <td>${product.productName}</td>
                            <td>${formatVND(product.retailPrice) + ' ₫'}</td>
                            <td><input type="number" class="rounded-md ring-1 ring-inset" id="quantity" name="quantity" min="1" value="${quantity}" data-id="${product._id}" style="width: 80px"></td>
                            <td>${formatVND(total) + ' ₫'}</td>
                            <td>
                                <button class="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded" id="btn-product-delete" data-id="${product._id}" ><i class="fa fa-trash-can" aria-hidden="true"></i></button>
                            </td>
                        </tr>
                    `;
                });
                $('#content').html(productHtml)
                totalAmount = grandTotal;
                $('#totalAmount').html(formatVND(grandTotal) + ' ₫')

            },
            error: function (error) {
                console.error('Error searching products:', error);
            }
        });
    });
    function formatVND(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    $(document).on('click', '#btn-product-delete', function () {
        const productId = $(this).data('id');
        // Tìm chỉ số của đối tượng có productId trong mảng products
        const indexToRemove = products.findIndex(item => item.product._id === productId);

        // Kiểm tra xem có tìm thấy đối tượng có id tương ứng không
        if (indexToRemove !== -1) {
            // Xóa đối tượng tại vị trí indexToRemove
            products.splice(indexToRemove, 1);

            // In ra mảng products để kiểm tra
            console.log('Mảng sau khi xóa:', products);
            var productHtml = "";

            $.each(products, function (index, item) {
                const product = item.product;
                const quantity = item.quantity;
                const total = item.total
                productHtml += `
                        <tr id="${product._id}">
                            <td>${index + 1}</td>
                            <td>${product.productName}</td>
                            <td>${formatVND(product.retailPrice) + ' ₫'}</td>
                            <td><input type="number" class="rounded-md ring-1 ring-inset" id="quantity" name="quantity" min="1" value="${quantity}" data-id="${product._id}" style="width: 80px"></td>
                            <td>${formatVND(total) + ' ₫'}</td>
                            <td>
                                <button class="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded" id="btn-product-delete" data-id="${product._id}" ><i class="fa fa-trash-can" aria-hidden="true"></i></button>
                            </td>
                        </tr>
                    `;
            });
            $('#content').html(productHtml)
            const grandTotal = products.reduce((acc, item) => acc + item.total, 0);
            totalAmount = grandTotal;
            $('#totalAmount').html(formatVND(totalAmount) + ' ₫')
            changeAmount = paidAmount - totalAmount;
            $('#changeAmount').html(formatVND(changeAmount) + ' ₫')

        } else {
            console.log('Không tìm thấy đối tượng với id =', productId);
        }
    })

    // Sự kiện khi người dùng nhập dữ liệu
    $('#searchInput').on('input', function () {
        // Lấy giá trị từ ô nhập liệu
        const searchValue = $(this).val();
        // Gọi API tìm kiếm sản phẩm
        searchProducts(searchValue);
    });

    function searchProducts(productName) {
        // Gọi API bằng AJAX
        $.ajax({
            url: `/api/product/filter?productName=${productName}`,
            method: 'GET',
            success: function (data) {
                // Xử lý dữ liệu trả về từ API và hiển thị lên giao diện
                displayProducts(data);
            },
            error: function (error) {
                console.error('Error searching products:', error);
            }
        });
    }

    function displayProducts(products) {
        // Xóa nội dung cũ của danh sách sản phẩm
        $('#productList').empty();

        // Hiển thị danh sách sản phẩm mới
        products.forEach(product => {
            const productItem = `
            <div class="product border" data-id=${product._id}>
            <div class="info">
                        <div class="name">${product.productName}</div>
                        <div class="price">${formatVND(product.retailPrice) + ' đ'}</div>
            </div>
            </div>`;
            $('#productList').append(productItem);
        });
    }


    $(document).on('click', '#btn-delete-customer', function () {

        orderCustomer = {}

        $('.my-search-customer').html(`
        <div class="hoverableCustomer relative" style="width: 400px;">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <input type="text" id="searchCustomer" placeholder="Thêm khách hàng vào đơn"
                class="w-full block p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-cyan-500 focus:border-cyan-500">
            <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" type="button"
                id="btn-add-customer"
                class="text-white absolute end-2.5 bottom-2.5 bg-cyan-500 hover:bg-cyan-600 focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm px-4 py-2"><i
                    class="fa-solid fa-plus"></i></button>
        </div>

        <div class="customers hoverableCustomer" id="customerList">
        </div>
        `)
    })

    // Sự kiện khi người dùng mouseenter vào ô nhập liệu
    $(document).on('mouseenter', '.hoverableCustomer', function () {
        $('#customerList').show();
    });
    $(document).on('mouseleave', '.hoverableCustomer', function () {
        $('#customerList').hide();
    });

    $(document).on('input', '#paidAmount', function () {
        // Loại bỏ ký tự không phải số và không phải dấu chấm (đối với số thập phân)
        $(this).val($(this).val().replace(/[^0-9.]/g, ''));

        // Kiểm tra xem số nhập vào có phải là số âm không
        var inputValue = $(this).val();
        if (parseFloat(inputValue) < 0) {
            $(this).val('');
        }
        paidAmount = parseInt(inputValue);
        changeAmount = paidAmount - totalAmount;

        $('#changeAmount').html(formatVND(changeAmount) + ' ₫');
        console.log(products)
        console.log(paidAmount)
        console.log(changeAmount)
    });

    $(document).on('click', '.customer', function () {

        // Lấy giá trị của thuộc tính data-id
        const customerId = $(this).data('id');
        // In ra thông báo hoặc thực hiện các thao tác khác dựa trên productId
        console.log('Bạn đã chọn khách hàng có ID:', customerId);

        const existingCustomer = customers.find(item => item._id === customerId);
        orderCustomer = existingCustomer;

        console.log(orderCustomer)


        $('.my-search-customer').html(`
        <div class="hoverableCustomer relative" style="width: 400px;">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <i class="fa-solid fa-user"></i>
            </div>
            <input readonly value="${existingCustomer.name} - ${existingCustomer.phone}" type="text" id="searchCustomer"
                class="w-full block p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" type="button"
                id="btn-delete-customer"
                class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <i class="fa-solid fa-xmark"></i>
                </button>
        </div>
`)

    });

    // Sự kiện khi người dùng nhập dữ liệu
    $(document).on('input', '#searchCustomer', function () {
        // Lấy giá trị từ ô nhập liệu
        const searchValue = $(this).val();
        // Gọi API tìm kiếm sản phẩm
        searchCustomers(searchValue);
    });

    function searchCustomers(phone) {
        // Gọi API bằng AJAX
        $.ajax({
            url: `/api/customer/filter?phone=${phone}`,
            method: 'GET',
            success: function (data) {
                // Xử lý dữ liệu trả về từ API và hiển thị lên giao diện
                customers = data;
                displayCustomers(data);
            },
            error: function (error) {
                console.error('Error searching products:', error);
            }
        });
    }

    function displayCustomers(customerList) {
        // Xóa nội dung cũ của danh sách sản phẩm
        $('#customerList').empty();
        // Hiển thị danh sách sản phẩm mới
        customerList.forEach(customer => {
            const customerItem = `
            <div class="customer border" data-id=${customer._id}>
            <div class="info">
                        <div class="name">${customer.name}</div>
                        <div class="price">${customer.phone}</div>
            </div>
            </div>`;
            $('#customerList').append(customerItem);
        });
    }

    $(document).on('click', '#btn-add-customer', function () {
        $('#crud-modal')
    })

    $(document).on('click', '#btn-submit', function () {
        let customer = {
            name: $('#name').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            address: $('#address').val()
        }

        $.ajax({
            type: "POST",
            url: `${SERVER_URL}/api/customer`,
            data: customer,
            success: function (data, status, xhr) {
                if (data.status == true) {
                    Swal.fire({
                        icon: 'success',
                        title: data.message,
                        showConfirmButton: false,
                        timer: 1500
                    })
                    let customer = data.data;
                    console.log('Bạn thêm khách hàng có ID:', customer._id);

                    orderCustomer = customer;

                    $('.my-search-customer').html(`
                    <div class="hoverableCustomer relative" style="width: 400px;">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <i class="fa-solid fa-user"></i>
                        </div>
                        <input readonly value="${orderCustomer.name} - ${orderCustomer.phone}" type="text" id="searchCustomer"
                            class="w-full block p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <button data-modal-target="crud-modal" data-modal-toggle="crud-modal" type="button"
                            id="btn-delete-customer"
                            class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <i class="fa-solid fa-xmark"></i>
                            </button>
                    </div>
                    `)

                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: data.message,
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
            },
            error: function (xhr, status, error) {
                console.log(status)
                Swal.fire({
                    icon: 'warning',
                    title: status,
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        });
        // $('#add-customer-modal').modal('hide')
    })


});
