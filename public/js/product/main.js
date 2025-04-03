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
                url: `${SERVER_URL}/api/product/${id}`,
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

    $('#btn-submit').on('click', function () {
        let btn = $(this)
        let id = btn.data('id');
        let product = {
            _id: id,
            barcode: $('#barcode').val(),
            productName: $('#productName').val(),
            importPrice: $('#importPrice').val(),
            retailPrice: $('#retailPrice').val(),
            category: $('#category').val(),
        }
        console.log(product)
        // Nếu là modal edit sản phẩm
        if (id) {
            $.ajax({
                type: "PUT",
                url: `${SERVER_URL}/api/product/${id}`,
                data: product,
                success: function (data, status, xhr) {
                    if (data.status == true) {
                        Swal.fire({
                            icon: 'success',
                            title: data.message,
                            showConfirmButton: false,
                            timer: 1500
                        })
                        // loadPage(currentPage)
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
        } else {
            // Tạo sản phẩm mới
            $.ajax({
                type: "POST",
                url: `${SERVER_URL}/api/product`,
                data: product,
                success: function (data, status, xhr) {
                    if (data.status == true) {
                        Swal.fire({
                            icon: 'success',
                            title: data.message,
                            showConfirmButton: false,
                            timer: 1500
                        })
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
                        title: data.message,
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
            });
        }
        // $('#product-modal').modal('hide')
    });

    function loadPage(page) {
        contentDiv.html(`<div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>`)

        $.ajax({
            type: "GET",
            url: `${SERVER_URL}/api/product?page=${page}`,
            success: function (data) {

                totalPages = data.totalPages;
                totalProdut = data.total;
                var products = data.data;

                var productHtml = "";
                console.log('currentPage' + currentPage)
                $.each(products, function (index, product) {
                    productHtml += `
                        <tr id="${product._id}">
                            <td>${((currentPage - 1) * 10) + index + 1}</td>
                            <td>${product.barcode}</td>
                            <td><a href="/admin/product-management/detail/${product._id}" class="font-medium text-blue-600 hover:underline">${product.productName}</a></td>
                            ${$('#add-product').length > 0 ? `<td>${formatVND(product.importPrice)} ₫</td>` : ''}
                            <td>${formatVND(product.retailPrice) + ' ₫'}</td>
                            <td>${product.category}</td>
                            <td>${formatDate(product.createdDate)}</td>
                            <td class="min-w-[140px]">
                                <a href="/admin/product-management/detail/${product._id}" class="px-3 py-[6px] bg-cyan-500 text-white ml-1 rounded-md text-xs btn-view">
                                    <i class="fas fa-info-circle"></i>
                                </a>
                            
                                ${$('#add-product').length > 0 ? `
                                <a href="/admin/product-management/edit/${product._id}" class="px-3 py-[6px] bg-yellow-500 text-white ml-1 rounded-md text-xs btn-edit">
                                    <i class="fas fa-edit"></i>
                                </a>
                        
                                <button class="px-3 py-[6px] bg-red-500 text-white ml-1 rounded-md text-xs btn-delete" data-id="${product._id}" data-name="${product.productName}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                                ` : ''}
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
                contentDiv.html('Lỗi api rồi! pagination.js');
            }
        });
    }

    function updatePagination() {
        if (currentPage === 1) {
            var paginationHtml = `
            <li class="pointer-events-none opacity-50 cursor-not-allowed flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"><button class="page-link" id="prevPageButton"><i class="fas fa-angle-double-left"></i></button></li>
        `;
        } else {
            var paginationHtml = `
            <li ><button class="page-link flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700" id="prevPageButton"><i class="fas fa-angle-double-left"></i></button></li>
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
            paginationHtml += `<li class="page-item disabled pointer-events-none opacity-50 cursor-not-allowed"><button class="page-link flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700" id="nextPageButton"><i class="fas fa-angle-double-right"></i></button></li>`;

        } else {
            paginationHtml += `<li class="page-item"><button class="page-link flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700" id="nextPageButton"><i class="fas fa-angle-double-right"></i></button></li>`;
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


    $("#search-input").on("input", function () {
        var inputValue = $(this).val();
        console.log("Người dùng đã nhập: " + inputValue);
        var searchValue = $("#search-product").val();

        if (searchValue === 'barcode') {
            $.ajax({
                url: `/api/product/filter?productName=${inputValue}`,
                method: 'GET',
                success: function (data) {
                    // Xử lý dữ liệu trả về từ API và hiển thị lên giao diện
                    displayProducts(data);
                },
                error: function (error) {
                    console.error('Error searching products:', error);
                }
            });
        } else if (searchValue === 'category') {
            $.ajax({
                url: `/api/product/filter?category=${inputValue}`,
                method: 'GET',
                success: function (data) {
                    // Xử lý dữ liệu trả về từ API và hiển thị lên giao diện
                    displayProducts(data);
                },
                error: function (error) {
                    console.error('Error searching products:', error);
                }
            });
        } else if (searchValue === 'brand') {
            $.ajax({
                url: `/api/product/filter?brand=${inputValue}`,
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
    });

    function displayProducts(products) {
        // Xóa nội dung cũ của danh sách sản phẩm
        contentDiv.empty();
        var productHtml = "";
        $.each(products, function (index, product) {
            productHtml += `
                <tr id="${product._id}">
                    <td>${((currentPage - 1) * 10) + index + 1}</td>
                    <td>${product.barcode}</td>
                    <td><a href="/admin/product-management/detail/${product._id}" class="font-medium text-blue-600 hover:underline">${product.productName}</a></td>
                    ${$('#add-product').length > 0 ? `<td>${formatVND(product.importPrice)} ₫</td>` : ''}
                    <td>${formatVND(product.retailPrice) + ' ₫'}</td>
                    <td>${product.category}</td>
                    <td>${formatDate(product.createdDate)}</td>
                    <td>
                        <a href="/admin/product-management/detail/${product._id}" class="px-3 py-[6px] bg-cyan-500 text-white ml-1 rounded-md text-xs btn-view">
                            <i class="fas fa-info-circle"></i>
                        </a>
                        ${$('#add-product').length > 0 ? `
                        <a href="/admin/product-management/edit/${product._id}" class="px-3 py-[6px] bg-yellow-500 text-white ml-1 rounded-md text-xs btn-edit">
                        <i class="fas fa-edit"></i>
                    </a>
                
                    <button class="px-3 py-[6px] bg-red-500 text-white ml-1 rounded-md text-xs btn-delete" data-id="${product._id}" data-name="${product.productName}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                        ` : ''}

                    
                    </td>
                </tr>
            `;
        });
        contentDiv.html(productHtml);
    }

});
