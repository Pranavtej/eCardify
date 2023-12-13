// Assuming you have a User model defined with Mongoose
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    phoneNumber: String,
    subscriptionStatus: String,
    cardType: String
    // Other fields as needed...
});

const User = mongoose.model('User', userSchema);

module.exports = User;
