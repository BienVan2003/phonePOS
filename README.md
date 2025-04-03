# Thành viên nhóm gồm:
       1. 52100773 - Nguyễn Văn Biên
       2. 52100540 - Lý Đại Cương
       3. 52100836 - Đặng Ngọc Sang

# Website bán điện thoại và phụ kiện

# [Link demo](https://youtu.be/R733hIhrQzk)

# Setup

## Clone dự án về:
       git clone https://github.com/BienVan2003/phonePOS.git
## Vào thư mục dự án và cài đặt dependencies:
       npm install
## Khởi động ứng dụng:
       npm start

# Tài khoản sẵn trong cơ sở dữ liệu
## Admin
       username: admin
       password: admin
## Nhân viên
       username: nvb221003
       password: nvb221003

# Hướng dẫn thêm cơ sở dữ liệu

1. Vào thư mục 52100773_52100540_52100836/database của dự án sẽ có sẵn 4 file collection như sau:
![File CSDL](https://i.imgur.com/eUqzG8P.png)

2. Mở MongoDBCompass tiến hàng tạo mới một Database tên PhoneStore và một collection tên users
![File CSDL](https://i.imgur.com/8q0CDVn.png)

3. Tiếp tục tạo thêm 3 collection lần lượt là products, orders, customers vào cơ sở dữ liệu PhoneStore
![File CSDL](https://i.imgur.com/w7qZgbO.png)

4. Tiến hành import file json trong folder 52100773_52100540_52100836/database tương ứng với từng tên collection
![File CSDL](https://i.imgur.com/EZuO5pB.png)
