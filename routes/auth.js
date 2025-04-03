const express = require('express');

//Authentication
const authenticateJWT = require('../app/middlewares/jwtAuthencation');

const router = express.Router();

const authController = require('../app/controllers/AuthController');

router.get('/login', authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/verify/:token', authController.verifyLogin);
router.get('/change-password', authenticateJWT, authController.showChangePassword);
router.post('/change-password', authenticateJWT , authController.changePassword);
router.get('/info/edit', authenticateJWT , authController.showEditInfoPage);
router.get('/userjwt', authenticateJWT , authController.getUserByJWT);
router.get('/info/:id', authController.showInfo);
// router.get('/', authController.index);
// router.get('/', authenticateJWT, authController.index);

module.exports = router;
