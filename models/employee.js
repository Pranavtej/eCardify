const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  photo: String,
  name: { type: String, required: true },
  contact: String,
  email: String,
  rank: Number,
  designation: {
    type: String,
    default: 'Agent', // Default designation is set to 'Agent'
  },
  teamSize: Number,
  experience: Number,
  achievements: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
});

module.exports = { Employee: mongoose.model('Employee', employeeSchema) };
