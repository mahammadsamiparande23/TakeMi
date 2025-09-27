// server/models/userModel.js (UPDATED)

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        // Optional if a GoogleId is present
        required: function() { return !this.googleId; }, 
    },

    password: {
        type: String,
        // Optional if a GoogleId is present
        required: function() { return !this.googleId; }, 
    },

    // ✅ NEW FIELDS FOR GOOGLE SIGN-IN
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows null values but ensures uniqueness for non-null
    },
    profilePicture: {
        type: String,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);