$(document).ready(function () {

    const SERVER_URL = 'http://localhost:8080';
    var contentDiv = $("#content");
    var paginationDiv = $("#pagination");
    var currentPage = 1;
    var totalPages = 1; // Khởi tạo số trang ban đầu là 1
    var totalProdut = 0;
    var orders = []

    loadPage(currentPage);


    // Bắt sự kiện click cho các nút View
    $(document).on('click', '.btn-view', function () {
        var button = $(this);
        var trId = $(this).closest('tr').attr('id');

        $('#totalAmount').html(trId)
        var foundOrder = orders.find(order => order._id === trId);
        console.log(foundOrder)
        $('#name').html(`Tên khách hàng: ${foundOrder.customer.name}`)
        $('#phone').html(`Số điện thoại: ${foundOrder.customer.phone}`)
        $('#address').html(`Địa chỉ: ${foundOrder.customer.address}`)
        $('#totalAmount').html(`Tổng tiền: ${formatVND(foundOrder.totalAmount)} đ`)
        $('#paidAmount').html(`Tiền khách đưa: ${formatVND(foundOrder.payment.paidAmount)} đ`)
        $('#changeAmount').html(`Tiền khách thừa: ${formatVND(foundOrder.payment.changeAmount)} đ`)
        $('#createdDate').html(`Ngày tạo đơn: ${formatDate(foundOrder.createdDate)}`)
        
        var productsHtml = "";
        $.each(foundOrder.products, function (index, item) {
            console.log(item)
            productsHtml +=`

            <div class="card bg-light mb-3">
                <div class="card-header">${((currentPage - 1) * 10) + index + 1}. ${item.product.productName}</div>
                <div class="card-body">
                    <h5 class="card-title">${item.product.category} - ${item.product.brand}</h5>
                    <p class="card-text">Giá: ${formatVND(item.product.retailPrice) + " ₫"}</p>
                    <p class="card-text">Số lượng: ${item.quantity}</p>
                    <p class="card-text">Thành tiền: ${formatVND(item.quantity * item.product.retailPrice)} đ</p>
                </div>
            </div>
            `;
        });
        $('#products').html(productsHtml)
        $('#order-modal').modal('show')
    });

    function loadPage(page) {
        contentDiv.html(`<div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>`)

        $.ajax({
            type: "GET",
            url: `${SERVER_URL}/api/order?page=${page}`,
            success: function (data) {
                totalPages = data.totalPages;
                totalProdut = data.total;
                var orderList = data.data;
                orders = orderList;
                console.log(orders)
                var orderHtml = "";
                $.each(orderList, function (index, order) {
                    orderHtml += `
                        <tr id="${order._id}">
                            <td>${((currentPage - 1) * 10) + index + 1}</td>
                            <td>${order.customer.name}</td>
                            <td>${formatVND(order.totalAmount) + ' ₫'}</td>
                            <td>${formatVND(order.payment.paidAmount) + ' ₫'}</td>
                            <td>${formatVND(order.payment.changeAmount) + " ₫"}</td>
                            <td>
                                <button class="btn btn-info btn-sm btn-view">Xem chi tiết</button>
                            </td>
                        </tr>
                    `;
                });
                $('#dtBasicExample_info').html(`Showing ${((currentPage - 1) * 10) + 1} to ${((currentPage - 1) * 10) + 10} of ${totalProdut} entries`)
                contentDiv.html(orderHtml);
                updatePagination();

            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải dữ liệu: " + error);
                contentDiv.html('Lỗi api rồi!');
            }
        });
    }

    function updatePagination() {
        if (currentPage === 1) {
            var paginationHtml = `
            <li class="page-item disabled"><button class="page-link" id="prevPageButton">Previous</button></li>
        `;
        } else {
            var paginationHtml = `
            <li class="page-item"><button class="page-link" id="prevPageButton">Previous</button></li>
        `;
        }


        var maxPages = totalPages >= currentPage + 2 ? currentPage + 2 : totalPages;

        for (var i = currentPage; i <= maxPages; i++) {
            if (currentPage === i) {
                paginationHtml += `
                <li class="page-item active"><button class="page-link" id="pageButton${i}">${i}</button></li>
            `;
            } else {
                paginationHtml += `
                <li class="page-item"><button class="page-link" id="pageButton${i}">${i}</button></li>
            `;
            }
        }
        if (currentPage === totalPages) {
            paginationHtml += `<li class="page-item disabled"><button class="page-link" id="nextPageButton">Next</button></li>`;

        } else {
            paginationHtml += `<li class="page-item"><button class="page-link" id="nextPageButton">Next</button></li>`;
        }
        paginationDiv.html(paginationHtml);
    }


    // Hàm định dạng ngày (bạn cần xác định hàm này nếu nó không tồn tại)
    function formatDate(dateTimeString) {
        const date = new Date(dateTimeString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };

        return date.toLocaleString(undefined, options);
    }
    function formatVND(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    function parseNumber(string) {
        return parseFloat(string.replace(/\./g, ""));
    }

    // Xử lý sự kiện khi người dùng click trang
    $("#pagination").on("click", "button.page-link", function () {
        var buttonId = $(this).attr("id");
        if (buttonId === "prevPageButton" && currentPage > 1) {
            currentPage--;
        } else if (buttonId === "nextPageButton" && currentPage < totalPages) {
            currentPage++;
        } else {
            currentPage = parseInt(buttonId.replace("pageButton", ""));
        }

        loadPage(currentPage);
        updatePagination();
    });


});
