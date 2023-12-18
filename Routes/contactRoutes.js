const express = require('express')
const router = express.Router();
const Controller = require('../Controllers/contactControllers')
const validateToken = require('../Middleware/validateTokenHandlers')


router.use(validateToken);
//get all contact 
router.get('/get-contact', Controller.getContact)

//post new contact
router.post('/', Controller.postContact)

//get one contact
router.get('/get-one/:id', Controller.createContact)

//update a contact
router.put('/update/:id', Controller.updateContact)

//delete contact
router.delete('/delete/:id', Controller.deleteContact)



module.exports = router;