const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    max: 160,
    min: 3,
    lowercase: true
  },
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  body: {
    type: {},
    required: true,
    min: 200,
    max: 2000000
  },
  excerpt: {
    type: String,
    max: 1000,
    //required: true
  },
  metaTitle: {
    type: String,
  },
  metaDescription: {
    type: String,
  },
  photo: {
    data: Buffer,
    contentType: String
  },
  categories: [{ type: ObjectId, ref: 'Category', require: true }],
  tags: [{ type: ObjectId, ref: 'Tag', require: true }],
  postedBy: {
    type: ObjectId,
    ref: 'User'
  },
  claps: {
    type: Number,
    default: 10
  }
}, { timestamps: true })



module.exports = mongoose.model('Blog', blogSchema);