const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: { values: ["Cash", "Credit"], message: "Type must be either Cash or Credit" }, 
    required: true 
  },

  produceName: { 
    type: String, 
    required: true,
    match: [/^[a-zA-Z0-9\s]+$/, 'Produce Name must be alpha-numeric']
  },
  produceType: { 
    type: String, 
    required: function() { return this.type === 'Credit'; },
    minlength: [2, 'Produce Type must be at least 2 characters'],
    match: [/^[a-zA-Z0-9\s]+$/, 'Produce Type must be alphabetic characters only']
  },
  tonnage: { type: Number, required: true },
  amountPaid: { 
    type: Number, 
    required: function() { return this.type === 'Cash'; },
    min: [10000, 'Amount Paid must be at least 5 digits']
  }, 
  amountDue: { 
    type: Number, 
    required: function() { return this.type === 'Credit'; },
    min: [10000, 'Amount Due must be at least 5 digits']
  },  

  buyerName: { 
    type: String, 
    required: true,
    minlength: [2, 'Buyer Name must be at least 2 characters'],
    match: [/^[a-zA-Z0-9\s]+$/, 'Buyer Name must be alpha-numeric']
  },
  nin: { 
    type: String,
    required: function() { return this.type === 'Credit'; },
    match: [/^[A-Z0-9]{13,14}$/, 'NIN must be valid format'],
    minlength: [14, 'NIN must be at least 14 characters']
  },
  location: { 
    type: String,
    required: function() { return this.type === 'Credit'; },
    minlength: [2, 'Location must be at least 2 characters'],
    match: [/^[a-zA-Z0-9\s]+$/, 'Location must be alpha-numeric']
  },
  contact: { 
    type: String,
    required: function() { return this.type === 'Credit'; },
    match: [/^\+?[\d\s-]{10,}$/, 'Contact must be a valid phone number']
  },

  salesAgentName: { 
    type: String, 
    required: true,
    minlength: [2, 'Sales Agent Name must be at least 2 characters'],
    match: [/^[a-zA-Z0-9\s]+$/, 'Sales Agent Name must be alpha-numeric']
  },
  dueDate: { type: Date, required: function() { return this.type === 'Credit'; } },
  dispatchDate: { type: Date, required: function() { return this.type === 'Credit'; } },

  date: { type: Date, required: function() { return this.type === 'Cash'; } },
  time: { type: String, required: function() { return this.type === 'Cash'; } }
});

module.exports = mongoose.model("Sale", saleSchema);
