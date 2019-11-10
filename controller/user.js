const User = require('../models/user');
const Blog = require('../models/blog')
const _ = require('lodash')
const formidable = require('formidable')
const fs = require('fs')
const { errorHandler } = require('../helpers/dbErrorHandler')
const { validationResult } = require('express-validator');


exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile)
}

exports.publicProfile = (req, res) => {
  let username = req.params.username;
  let user;
  let blogs;
  User.findOne({ username }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: 'user not found'
      })
    }
    user = data;
    let userId = user._id
    Blog.find({ postedBy: userId })
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name')
      .select('_id title slug excerpt categories postedBy tags createAt updateAt')
      .exec((err, blogs) => {
        if (err) {
          return res.status(400).json({
            error: error
          })

        }
        res.status(200).json({ user, blogs })
      })
  })

}
exports.updateProfile = (req, res) => {
  let form = new formidable.IncomingForm;
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {

    if (err) {
      return res.status(400).json({
        error: 'Photo could not be upload'
      })
    }

    let user = req.profile;
    user = _.extend(user, fields)

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          error: 'image should be less than 1mb'
        })
      }

      user.photo.data = fs.readFileSync(files.photo.path)
      user.photo.contentType = files.photo.type;
    }
    if (files.password && files.password.length < 6) {

      return res.status(400).json({
        error: 'Password should be 6 characters long'
      })
    }
    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        })
      }
      user.salt = undefined
      user.hashed_password = undefined;
      res.json(user)
    })
  })
}
exports.photo = (req, res) => {
  const username = req.params.username;
  User.findOne({ username }).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      })
    }
    if (user.photo.data) {
      res.set('Content-type', user.photo.contentType)
      return res.send(user.photo.data)
    }
  })
}