$(document).ready(function () {

    const SERVER_URL = 'http://localhost:8080';
    var contentDiv = $("#content");
    var paginationDiv = $("#pagination");
    var currentPage = 1;
    var totalPages = 1; // Khởi tạo số trang ban đầu là 1
    var totalProdut = 0;

    loadPage(currentPage);

    // Bắt sự kiện click cho các nút Xóa
    $(document).on('click', '.btn-delete', function () {
        let btn = $(this);
        // Lấy giá trị của các thuộc tính dữ liệu
        let id = btn.data('id'); // Truy cập vào thuộc tính data-id
        let name = btn.data('name'); // Truy cập vào thuộc tính data-name
        var result = window.confirm(`Bạn có muốn xóa ${name} không ?`);
        // Check the user's choice
        if (result) {
            $.ajax({
                type: "DELETE",
                url: `${SERVER_URL}/api/customer/${id}`,
                success: function (data) {
                    Swal.fire({
                        icon: 'success',
                        title: data.message,
                        showConfirmButton: true,
                        allowOutsideClick: false, // Prevent closing by clicking outside the modal
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Reload the page when the user clicks "OK"
                            location.reload();
                        }
                    });
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
        } else {

        }
    });

    function loadPage(page) {
        contentDiv.html(`<div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>`)

        $.ajax({
            type: "GET",
            url: `${SERVER_URL}/api/customer?page=${page}`,
            success: function (data) {

                totalPages = data.totalPages;
                totalProdut = data.total;
                var customers = data.data;

                var productHtml = "";

                $.each(customers, function (index, customer) {
                    productHtml += `
                        <tr id="${customer._id}">
                            <td>${((currentPage - 1) * 10) + index + 1}</td>
                            <td><a href="/admin/customer-management/detail/${customer._id}" class="font-medium text-blue-600 hover:underline" >${customer.name}</a></td>
                            <td>${customer.email}</td>
                            <td>${customer.phone}</td>
                            <td>${customer.address}</td>
                            <td>
                                <a href="/admin/customer-management/detail/${customer._id}" class="px-3 py-[6px] bg-cyan-500 text-white ml-1 rounded-md text-xs btn-view"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
                                ${$('#cur-user-name').data('role') === 'admin' ? `<a class="cursor-pointer px-3 py-[6px] bg-red-500 text-white ml-1 rounded-md text-xs btn-delete" data-id="${customer._id}" data-name="${customer.name}" ><i class="fa fa-trash-can" aria-hidden="true"></i></a>` : ''}
                            </td>
                        </tr>
                    `;
                });
                // $('#dtBasicExample_info').html(`Showing ${((currentPage - 1) * 10) + 1} to ${((currentPage - 1) * 10) + 10} of ${totalProdut} entries`)
                contentDiv.html(productHtml);
                updatePagination();

            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi tải dữ liệu: " + error);
                contentDiv.html('Lỗi api rồi! main.js');
            }
        });
    }

    function updatePagination() {
        if (currentPage === 1) {
            var paginationHtml = `
            <li class="pointer-events-none opacity-50 cursor-not-allowed flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"><button class="page-link" id="prevPageButton">Previous</button></li>
        `;
        } else {
            var paginationHtml = `
            <li ><button class="page-link flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700" id="prevPageButton">Previous</button></li>
        `;
        }


        var maxPages = totalPages >= currentPage + 2 ? currentPage + 2 : totalPages;

        for (var i = currentPage; i <= maxPages; i++) {
            if (currentPage === i) {
                paginationHtml += `
                <li class="page-item active"><button class="page-link flex items-center justify-center px-3 h-8 text-white border border-gray-500 bg-cyan-500 hover:bg-cyan-600" id="pageButton${i}">${i}</button></li>
            `;
            } else {
                paginationHtml += `
                <li class="page-item"><button class="page-link flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700" id="pageButton${i}">${i}</button></li>
            `;
            }
        }
        if (currentPage === totalPages) {
            paginationHtml += `<li class="page-item disabled pointer-events-none opacity-50 cursor-not-allowed"><button class="page-link flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700" id="nextPageButton">Next</button></li>`;

        } else {
            paginationHtml += `<li class="page-item"><button class="page-link flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700" id="nextPageButton">Next</button></li>`;
        }
        paginationDiv.html(paginationHtml);
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

    $("#search-input").on("input", function () {
        var inputValue = $(this).val();
        console.log("Người dùng đã nhập: " + inputValue);

        $.ajax({
            url: `/api/customer/filter?phone=${inputValue}`,
            method: 'GET',
            success: function (data) {
                // Xử lý dữ liệu trả về từ API và hiển thị lên giao diện
                displayCustomers(data);
            },
            error: function (error) {
                console.error('Error searching products:', error);
            }
        });

    });

    function displayCustomers(customers) {
        // Xóa nội dung cũ của danh sách sản phẩm
        contentDiv.empty();
        var productHtml = "";
        $.each(customers, function (index, customer) {
            productHtml += `
            <tr id="${customer._id}">
            <td>${((currentPage - 1) * 10) + index + 1}</td>
            <td><a href="/admin/customer-management/detail/${customer._id}" class="font-medium text-blue-600 hover:underline" >${customer.name}</a></td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address}</td>
            <td>
                <a href="/admin/customer-management/detail/${customer._id}" class="px-3 py-[6px] bg-cyan-500 text-white ml-1 rounded-md text-xs btn-view"><i class="fa fa-info-circle" aria-hidden="true"></i></a>
                ${$('#cur-user-name').data('role') === 'admin' ? `<a class="cursor-pointer px-3 py-[6px] bg-red-500 text-white ml-1 rounded-md text-xs btn-delete" data-id="${customer._id}" data-name="${customer.name}" ><i class="fa fa-trash-can" aria-hidden="true"></i></a>` : ''}
                
            </td>
        </tr>
            `;
        });
        contentDiv.html(productHtml);
    }


});
