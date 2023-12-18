// get all contacts
//route to GET contacts /api/contact
//create a const, remove the logic and make it equal to the contact
//{
//whenever we make use of the mongodb, we alawys get a promise thats 
//why we use the "async". To get an error using the async we need to use the
//the try&catch block. A package called asyncHandler does that.(express-async-handler)
//} 

const asyncHandler = require('express-async-handler');
const  Contact = require('../Model/contactSchema');


const getContact = asyncHandler (async (req, res) => {
    //find the contact of a logged in user 
    const contact = await Contact.find({ user_id: req.user.id});
    res.status(200).json(contact);
});

//post a new contact
//route to POST contact /api/contact
//a user must enter the required info first, then he can create an account
const postContact =asyncHandler (async (req, res) => {
    const {name, email, phone} = req.body;
    if(!name || !email || !phone) {
        res.status(400);
        throw new Error('All fields are mandatory')
    }
        const contact = await Contact.create({
            name,
            email, 
            phone,
           user_id: req.user.id
        })
        res.status(200).json(contact);     
});

//create a new contact
//route to GET a new contact
//a user must exist before you update
const createContact =asyncHandler (async (req, res) => {
     const contact = await Contact.findById(req.params.id);
     if(!contact) {
        res.status(404)
        throw new Error('contact not found');
     }
    res.status(200).json(contact)
});

//update a particular contact
//route to PUT a contact /api/contact
//check if a contact exist, then update it
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
//route to DELETE contact
//check if the user exist, then delete it
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
    getContact,
    postContact,
    createContact,
    updateContact,
    deleteContact
}