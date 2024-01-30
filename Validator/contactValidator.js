const joi = require('joi');

const validator = (schema) => (payload) => 
schema.validate(payload, { abortEarly: false });

//create contact 
const createContactValidation = joi.object({
    name: joi.string().lowercase().required(),
    email: joi.string().email().lowercase().required(),
    phone: joi.string().min(11).max(11).required()
});






exports.createContactValidation = validator(createContactValidation)