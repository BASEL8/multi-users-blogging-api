const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema
const adminSchema = new mongoose.Schema({
  allUsersCount: {
    type: String,
    default: '0'
  },
  RemovedAccounts: {
    type: String,
    default: '0'
  },
  sentEmails: {
    type: String,
    default: '0'
  }
}, { timestamps: true })



module.exports = mongoose.model('Admin', adminSchema);