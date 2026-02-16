const mongoose = require("mongoose");

const procurementSchema = new mongoose.Schema({
  produceName: { type: String, required: true, match: [/^[a-zA-Z0-9\s]+$/, 'Name of produce must be alpha-numeric']},
  produceType: { type: String, required: true,
    minlength: [2, 'Type of produce must be at least 2 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Type of produce must be alphabetic characters only']
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  tonnage: { type: Number, required: true, min: [100, 'Tonnage must be at least 100'] },
  cost: { type: Number, required: true, min: [10000, 'Cost must be at least 10000'] },
  dealerName: { 
    type: String, 
    required: true,
    minlength: [2, 'Dealer Name must be at least 2 characters'],
    match: [/^[a-zA-Z0-9\s]+$/, 'Dealer Name must be alpha-numeric']
  },
  branch: { 
    type: String, 
    enum: { values: ["Maganjo", "Matugga"], message: "Branch must be either Maganjo or Matugga" }, 
    required: true 
  },
  contact: { 
    type: String, 
    required: true,
    match: [/^\+?[\d\s-]{10,}$/, 'Contact must be a valid phone number']
  },
  sellingPrice: { type: Number, required: true, min: [10000, "Selling price must be at least 10000"] }
});

module.exports = mongoose.model("Procurement", procurementSchema);
