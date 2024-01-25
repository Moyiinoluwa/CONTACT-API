const asyncHandler = require('express-async-handler');
const  Contact = require('../Model/contactSchema');


//get all user contact
const getAllContact = asyncHandler (async (req, res) => {
    //find the contact of a logged in user 
    const contact = await Contact.find({ user_id: req.user.id});
    res.status(200).json(contact);
});

//Create a new contact
const createContact = asyncHandler (async (req, res) => {
    console.log('moyin nane')
    try {
        const {name, email, phone} = req.body;
    if(!name || !email || !phone) {
       // console.log('this code sucks')
        res.status(400);
        throw new Error('All fields are mandatory')
    }
        const contact = await Contact({
            name,
            email, 
            phone,
           user_id: req.user.id
        })
       // console.log('thingsss')
        res.status(200).json(contact);    
    } catch (error) {
        throw error
    }
});


//Get a contact by id
const getContactId = asyncHandler (async (req, res) => {
     const contact = await Contact.findById(req.params.id);
     if(!contact) {
        res.status(404)
        throw new Error('contact not found');
     }
    res.status(200).json(contact)
});

//update a contact 
const updateContact =asyncHandler (async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact) {
        res.status(404)
        throw new Error('contact not found');
     }

     if (contact.user_id.toString()!== req.user.id) {
        res.status(403);
        throw new Error('User dont have permission to update another contact')
     }
    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    )
    res.status(200).json(updatedContact);
});
//delete a contact
const deleteContact =asyncHandler (async (req, res) => {
    const contact = await Contact.findById(req.params.id);
    if(!contact) {
        res.status(404)
        throw new Error('contact not found');
     }
     if (contact.user_id.toString()!== req.user.id) {
        res.status(403);
        throw new Error('User dont have permission to delete another contact')
     }

        await Contact.deleteOne({ _id: req.params.id });
    res.status(200).json(contact)
});

module.exports = {
    getAllContact,
    getContactId,
    createContact,
    updateContact,
    deleteContact
}