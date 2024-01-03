const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    image:String,
    name:String,
    Position:String,
    company:String,
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;