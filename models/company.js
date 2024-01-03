const mongoose = require('mongoose');

const combinedCompanySchema = new mongoose.Schema({
  logo: String,
  name: { type: String, required: true },
  ceo: {
    name: String,
    contact: String,
    email: String,
  },
  status: { type: Number, default: 0 },
  // Add other company-related fields as needed
});
const CombinedCompany = mongoose.model('CombinedCompany', combinedCompanySchema);

module.exports = CombinedCompany;
