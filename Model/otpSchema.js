const mongoose = require('mongoose');

const OtpSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    otp: {
        type:  String,
        required: true
    },
    email: { 
        type: String,
        required:  true,
        unique: false
    },
    expirationTime: {
        type: Date,
        required: true, 
    },

    verified: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Otp', OtpSchema);