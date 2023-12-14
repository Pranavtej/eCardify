// Assuming you have a User model defined with Mongoose
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true,
    },
    subscriptionStatus:{
        type: String,
        required: true,
    },
    cardType: {
        type: String,
        required: true,
    },
    // Other fields as needed...
});

const User = mongoose.model('User', userSchema);

module.exports = User;
