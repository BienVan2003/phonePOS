const userRoleElement = document.querySelector('#user-role');
const containerOrder = document.querySelector('#container-order');
if (userRoleAPI === 'admin') {
        userRoleElement.textContent = 'Quản trị viên';
}
else {
        userRoleElement.textContent = 'Nhân viên';
}

function handleNavigateBack() {
        window.history.back();
}
