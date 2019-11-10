const Category = require('../models/category');
const Blog = require('../models/blog')
const slugify = require('slugify')
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.create = (req, res) => {
  const { name } = req.body;
  console.log(name)
  let slug = slugify(name).toLowerCase();
  let category = new Category({ name, slug });
  category.save((err, data) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) })
    }
    res.json(data)
  })
}
exports.list = (req, res) => {
  Category.find({}).exec((err, data) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) })
    }
    res.json(data)
  })
}
exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase()
  Category.findOne({ slug }).exec((err, category) => {
    if (err) {
      return res.status(400).json({ error: errorHandler(err) })
    }
    Blog.find({ categories: category })
      .populate('categories', '_id name slug')
      .populate('tags', '_id name slug')
      .populate('postedBy', '_id name')
      .select('_id title slug excerpt categories postedBy tags createAt updateAt')
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          })
        }
        res.json({ category, blogs: data })
      })
  })
}
exports.remove = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  console.log(slug)
  Category.findOneAndRemove({ slug }).exec(
    (err, data) => {
      console.log(err)
      if (err) {
        return res.status(400).json({ error: errorHandler(err) })
      }
      res.json({ message: 'category deleted successfully' })
    }
  )
}