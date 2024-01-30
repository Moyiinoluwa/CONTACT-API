const asyncHandler = require('express-async-handler');
const Contact = require('../Model/contactSchema');
const { createContactValidation } = require('../Validator/contactValidator');


//get all user contact
const getAllContact = asyncHandler(async (req, res) => {
    //find the contact of a logged in user 
    const contact = await Contact.find({ user_id: req.user.id });
    res.status(200).json(contact);
});

//Create a new contact
const createContact = asyncHandler(async (req, res) => {
    console.log('tree')
    try {
        //validate the user input
        console.log('money')
        const { error, value } = await createContactValidation(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        const { name, email, phone } = req.body
        console.log('school')
        //check if user has registered the same name, email and phone number before
        const user = await Contact.findOne({ $or: [ {name}, {email}, {phone} ]})
        if(user.name === name) {
            res.status(400).json({ message: 'name already exist'})
        }

        if(user.email === email) {
            res.status(400).json({ message: 'email already exist'})
        }

        if(user.phone === phone) {
            res.status(400).json({ message: 'phone number already exist'})
        } 
        console.log('neww')
        //create a new contact
        const contact = await Contact({
            name,
            email,
            phone,
            user_id: req.user.id
        })

        res.status(200).json(contact);

    } catch (error) {
        throw error
    }
});


//Get a contact by id
const getContactId = asyncHandler(async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404).json({message: 'contact not found'});
    }

    res.status(200).json(contact)

    } catch (error) {
        throw error
    }
});

//update a contact 
const updateContact = asyncHandler(async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
    if (!contact) {
        res.status(404).json({ message: 'contact not found'});
    }

    if (contact.user_id.toString() !== req.user.id) {
        res.status(403).json({message: 'User dont have permission to update another contact'})
    }
    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    )
    res.status(200).json(updatedContact);

    } catch (error) {
        throw error
    }
});
//delete a contact
const deleteContact = asyncHandler(async (req, res) => {
  try {
    
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
        res.status(404).json({message: 'contact not found'});
    }
    if (contact.user_id.toString() !== req.user.id) {
        res.status(403).json({ message: 'User dont have permission to delete another contact'})
    }

    await Contact.deleteOne({ _id: req.params.id });

    res.status(200).json(contact)

  } catch (error) {
    throw error
  }
});

module.exports = {
    getAllContact,
    getContactId,
    createContact,
    updateContact,
    deleteContact
}