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
  const { month_, year_ } = req.params
  Blog.aggregate(
    [
      {
        "$redact": {
          "$cond": [
            {
              "$and": [
                { "$eq": [{ "$month": "$createdAt" }, parseInt(month_)] },
                { "$eq": [{ "$year": "$createdAt" }, parseInt(year_)] }
              ]
            },
            "$$KEEP",
            "$$PRUNE"
          ]
        }
      }
      ,
      {
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
    res.json({ data: data })
  })
}
exports.getTagsData = (req, res) => {
  const { year_, month_ } = req.params
  Blog.aggregate([
    {
      "$redact": {
        "$cond": [
          {
            "$and": [
              { "$eq": [{ "$month": "$createdAt" }, parseInt(month_)] },
              { "$eq": [{ "$year": "$createdAt" }, parseInt(year_)] }
            ]
          },
          "$$KEEP",
          "$$PRUNE"
        ]
      }
    }
    , { $unwind: "$tags" },
    { $group: { "_id": "$tags", "count": { $sum: 1 } } },

  ]).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      })
    }
    res.json(data)
  })
}
exports.getCategoriesData = (req, res) => {
  const { year_, month_ } = req.params
  Blog.aggregate([
    {
      "$redact": {
        "$cond": [
          {
            "$and": [
              { "$eq": [{ "$month": "$createdAt" }, parseInt(month_)] },
              { "$eq": [{ "$year": "$createdAt" }, parseInt(year_)] }
            ]
          },
          "$$KEEP",
          "$$PRUNE"
        ]
      }
    }
    , { $unwind: "$categories" },
    { $group: { "_id": "$categories", "count": { $sum: 1 } } },
  ]).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      })
    }
    console.log(data)
    res.json(data)
  })
}