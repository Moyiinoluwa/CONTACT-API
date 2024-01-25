const express = require('express');
const Controller = require('../Controllers/userController');
const validateToken = require('../Middleware/validateTokenHandlers');
const upload = require('../Middleware/uploadFile');

const router = express.Router();

router.get('/get-users', Controller.getUser)

router.get('/get/:id', Controller.getOneUser)

router.post('/register', Controller.registerUser)

router.post('/register-link', Controller.registerLinkUser)

router.post('/login', Controller.login);

router.put('/update/:id',validateToken, Controller.updateUser);

router.delete('/delete/:id', Controller.deleteUser)

router.get('/current-user', validateToken, Controller.currentUser);

router.post('/verify-otp', Controller.verifyUserOtp)

router.post('/verify-token ', Controller.verifyUserOtpLink)

router.post('/resend-otp', Controller.resendOtp)

router.post('/reset-password-token', Controller.sendResetPasswordLink)

router.patch('/resend-password', Controller.resetPassword)

router.patch('/change-password', Controller.changePasswordLink)

//router.patch('/upload', Controller.userUpload)

router.patch('/upload/:id', upload, Controller.uploadNew)

module.exports = router;