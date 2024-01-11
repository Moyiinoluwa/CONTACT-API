const express = require('express');
const Controller = require('../Controllers/userController');
const validateToken = require('../Middleware/validateTokenHandlers');

const router = express.Router();

router.get('/get-users', Controller.getUser)

router.get('/get/:id', Controller.getOneUser)

router.post('/register', Controller.registerUser)

router.post('/register-link', Controller.registerLinkUser)

router.post('/login', Controller.login);

router.put('/update/:id',validateToken, Controller.updateUser);

router.delete('/delete/:id', Controller.deleteUser)

router.get('/current', validateToken, Controller.getCurrent);

router.post('/verify-otp', Controller.verifyUserOtp)

router.post('/verify-token ', Controller.verifyUserOtpLink)

router.post('/resend-otp', Controller.resendOtp)

router.post('/reset-password-token', Controller.sendResetPasswordToken)

router.patch('/resend-password', Controller.finallyResetPassword)

router.patch('/change-password', Controller.changePasswordLink)

router.patch('/upload/:id', Controller.userUpload)

module.exports = router;