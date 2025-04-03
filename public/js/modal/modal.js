const modal = document.querySelector('#modal');
const modalHead = document.querySelector('#modal-head');
const modalBody = document.querySelector('#modal-body');
const btnModalLeft = document.querySelector('#btn-modal-left');
const btnModalRight = document.querySelector('#btn-modal-right');
const handleCloseModal = () => {
        modal.classList.add('hidden');
}
const handleNoClose = (event) => {
        event.stopPropagation();
}
const handleOpenModal = (setting, data, f) => {
        modal.classList.remove('hidden');
        modalHead.textContent = setting.modalHead;
        modalBody.innerHTML = setting.modalBody;
        btnModalLeft.innerText = setting.btnLeft;
        btnModalRight.innerText = setting.btnRight;
        btnModalRight.onclick = () => {
                f(data);
        };
}