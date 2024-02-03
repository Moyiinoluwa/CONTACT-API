 const express = require('express')
const router = express.Router();
const Controller = require('../Controllers/contactControllers')
const validateToken = require('../Middleware/validateTokenHandlers')

router.use(validateToken)



//get all contact 
router.get('/get-contact', Controller.getAllContact)

//post new contact
router.post('/create', Controller.createContact)

//get one contact
router.get('/get/:id', Controller.getContactId)

//update a contact
router.put('/update/:id', Controller.updateContact)

//delete contact
router.delete('/delete/:id', Controller.deleteContact)



module.exports = router;