const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [ true, 'Please enter your username']
    },
    email: {
        type: String,
        required: [ true, 'Please enter an email'],
        unique: [ true, 'Email address already taken']
    },
    password: {
        type: String,
        required: [ true, 'Please enter user password']
    },
    Isverified: {
        type: Boolean,
        default: false
    },
    Isloggedin: {
        type: Boolean,
        default: false
    },
    Isloggedout: {
        type: Boolean,
        default: false
    },
    Ispasswordresentlinksent: {
        type: Boolean,
        default: false
    },
    resetlink: {
        type: String,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);

 
  

