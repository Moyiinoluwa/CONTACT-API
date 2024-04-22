const Joi = require('joi');
const otpMail = require('../Shared/mailer');

const validator = (schema) => (payload) =>
schema.validate(payload, { abortEarly: false }); 

const signupValidation = Joi.object({
  username: Joi.string().lowercase().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(16).required(),
  // confirmPassword: Joi.ref('password'),
  // address: Joi.object({
  //   state: Joi.string().length(2).required(),
  // }),
  // DOB: Joi.date().greater('2012-01-01').required(),
  // referred: Joi.boolean().required(),
  // referralDetails: Joi.string().when('referred', {
  //   is: true,
  //   then: Joi.string().required().min(8).max(50),
  //   otherwise: Joi.string().optional(),
  // }),
  // hobbies: Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number())),
  // acceptTos: Joi.boolean().truthy('yes').required(),
});
 
// login validator
const loginUserValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(16).required()
});

//verify otp
const verifyOtpValidation = Joi.object({
    otp: Joi.string().min(6).max(6).required()
});

//resend otp link 
const resendOtpLinkValidation = Joi.object({
  email: Joi.string().email().required(),
});

//resend password link
const resendPasswordLinkValidation = Joi.object({
  email: Joi.string().email().required(),
});
  
//reset password link
const resetPasswordLinkValidation = Joi.object({
    email: Joi.string().email().required()
})

//change user password
const changePasswordValidationLink = Joi.object({
  email: Joi.string().email().optional(),
   existingPassword: Joi.string().required(),
   newPassword: Joi.string().required()
});




exports.signupValidation =  validator(signupValidation)
exports.verifyOtpValidation = validator(verifyOtpValidation)
exports.loginUserValidation = validator(loginUserValidation)
exports.resendOtpLinkValidation = validator(resendOtpLinkValidation)
exports.resendPasswordLinkValidation = validator(resendPasswordLinkValidation)
exports.resetPasswordLinkValidation = validator(resetPasswordLinkValidation)
exports.changePasswordValidationLink = validator(changePasswordValidationLink)