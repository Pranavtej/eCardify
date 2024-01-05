const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  photo: String,
  name: { type: String, required: true },
  contact: String,
  email: String,
  address : String,
  rank: Number,
  designation: {
    type: String,
    default: 'Agent', // Default designation is set to 'Agent'
  },
  employeeid : String,
  branchid : String,
  area : {
    type: String,
    default: 'NA',
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

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;