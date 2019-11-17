const Blog = require('../models/blog')
const Category = require('../models/category')
const Tag = require('../models/tag')
const User = require('../models/user')
const _ = require('lodash')
const { errorHandler } = require('../helpers/dbErrorHandler')


exports.getGeneralData = (req, res) => {

  Blog.countDocuments().exec((err, blogs) => {

    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      })
    } else {
      User.countDocuments().exec((err, users) => {

        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          })
        } else {
          Category.countDocuments().exec((err, categories) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err)
              })
            } else {
              Tag.countDocuments().exec((err, tags) => {
                if (err) {
                  return res.status(400).json({
                    error: errorHandler(err)
                  })
                } else {
                  res.json({
                    blogs, users, categories, tags
                  })
                }
              })
            }
          })
        }
      })
    }
  })
  //count user
  //count blogs
  //count emails to user
}


exports.getBlogsData = (req, res) => {
  Blog.aggregate(
    [{
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        count: { $sum: 1 }
      }
    }]
  ).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      })
    }
    console.log(data)
    res.json({ blogs: 10, users: 15, categories: 12, tags: 1 })
  })
}