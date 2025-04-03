const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

const accountController = require('../app/controllers/AccoutController');


//api
router.post('/edit/name', accountController.editName);
router.post('/edit/avatar',upload.single('image') , accountController.editAvatar);
router.get('/images/:filename', accountController.getImage);
router.post('/edit/phone', accountController.editPhone);
router.post('/edit/facebook', accountController.editFacebookUrl);
router.post('/edit/instagram', accountController.editInstagramUrl);


//server render

router.put('/locked/:id', accountController.locked);
router.put('/unlocked/:id', accountController.unLocked);
router.post('/send', accountController.sendMail);
router.get('/add', accountController.showAdd);
router.post('/add', accountController.add);
// router.get('/panigation', accountController.getAllByPanigation);
router.get('/', accountController.getAll);

module.exports = router;
