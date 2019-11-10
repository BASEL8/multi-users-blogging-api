const Blog = require('../models/blog')
const Category = require('../models/category')
const Tag = require('../models/tag')
const formidable = require('formidable')
const slugify = require('slugify')
const stripHtml = require('string-strip-html')
const _ = require('lodash')
const { errorHandler } = require('../helpers/dbErrorHandler')
const fs = require('fs')
const { smartTrim } = require('../helpers/blog')

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    console.log(fields)

    if (err) {
      return res.status(400).json({ error: 'image could not be upload' })
    }
    const { title, body, categories, tags } = fields;
    if (!title || !title.length) {
      return res.status(400).json({ error: 'title is required' })
    }
    if (title.length < 4) {
      return res.status(400).json({ error: 'title is short' })
    }
    if (!body || body.length < 200) {
      return res.status(400).json({ error: 'content is short' })
    }
    if (!categories || categories.length === 0) {
      return res.status(400).json({ error: 'att lest one category is required' })
    }
    if (!tags || tags.length === 0) {
      return res.status(400).json({ error: 'att lest one tag is required' })
    }
    let blog = new Blog();
    blog.title = title;
    blog.body = body;
    blog.excerpt = smartTrim(stripHtml(body), 200, ' ', ' ...');
    blog.slug = slugify(title).toLowerCase();
    blog.metaTitle = `${title} | ${process.env.APP_NAME}`;
    blog.metaDescription = stripHtml(body.substring(0, 160));
    blog.postedBy = req.user._id;

    let arrayOfCategories = categories && categories.split(',')
    let arrayOfTags = tags && tags.split(',')

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({ error: 'image could not be upload,try with size less than 1 mb' })
      }
      blog.photo.data = fs.readFileSync(files.photo.path);
      blog.photo.type = files.photo.type
    }
    blog.save((err, data) => {
      if (err) {
        return res.status(400).json({ error: errorHandler(err) })
      }
      //res.json(data)
      Blog.findByIdAndUpdate(data._id, { $push: { categories: arrayOfCategories } }, { new: true }).exec((err, data) => {
        if (err) {
          return res.status(400).json({ error: errorHandler(err) })
        }
        Blog.findByIdAndUpdate(data._id, { $push: { tags: arrayOfTags } }, { new: true }).exec((err, data) => {
          if (err) {
            return res.status(400).json({ error: errorHandler(err) })
          }
          res.json(data)
        })
      })
    })

  })

}
exports.list = (req, res) => {
  Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt photo')
    .exec((err, data) => {
      if (err) {
        return res.json({ error: err })
      }
      res.json(data)
    })

}

exports.listUserPlogs = (req, res) => {
  console.log(req.body)
  const { _id } = req.body
  Blog.find({ postedBy: { $eq: _id } })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt photo')
    .exec((err, data) => {
      if (err) {
        return res.json({ error: err })
      }
      res.json(data)
    })

}
exports.listAllBlogsCategoriesTgs = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let blogs;
  let categories;
  let tags;
  Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
    .exec((err, data) => {
      if (err) {
        return res.json({ error: err })
      }
      blogs = data;
      Category.find({})
        .exec((err, data) => {
          if (err) {
            return res.json({ error: err })
          }
          categories = data
          Tag.find({})
            .exec((err, data) => {
              if (err) {
                return res.json({ error: err })
              }
              tags = data
              res.json({ blogs, categories, tags, size: blogs.length })
            })
        })
    })

}
exports.read = (req, res) => {
  const slug = req.params.slug.toLowerCase()
  Blog.findOne({ slug })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username photo')
    .select('_id title slug body metaTitle metaDescription categories tags postedBy createdAt updatedAt photo')
    .exec((err, data) => {
      if (err) {
        return res.json({ error: err })
      }
      res.json(data)
    })

}
exports.readPart = (req, res) => {
  const slug = req.params.slug.toLowerCase()
  Blog.findOne({ slug })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username photo')
    .select('_id title slug excerpt  metaTitle metaDescription categories tags postedBy createdAt updatedAt photo')
    .exec((err, data) => {
      if (err) {
        return res.json({ error: err })
      }
      res.json(data)
    })

}
exports.adminRemoveBlog = (req, res) => {
  const slug = req.params.slug.toLowerCase()
  Blog.findOneAndRemove({ slug })
    .exec((err, data) => {
      if (err) {
        return res.json({ error: err })
      }
      res.json({ message: 'blog deleted successfully' })
    })
}
exports.userRemoveBlog = (req, res) => {
  const slug = req.params.slug.toLowerCase()
  Blog.findOneAndRemove({ slug })
    .exec((err, data) => {
      if (err) {
        return res.json({ error: err })
      }
      res.json({ message: 'blog deleted successfully' })
    })
}
exports.update = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const { _id } = req.user
  Blog.findOne({ slug, postedBy: _id }).exec((err, oldBlog) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    if (oldBlog === null) {
      return res.status(400).json({
        error: 'not allowed to change'
      })
    }

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: 'Image could not upload'
        });
      }

      let slugBeforeMerge = oldBlog.slug;
      oldBlog = _.merge(oldBlog, fields);
      oldBlog.slug = slugBeforeMerge;

      const { body, metaDescription, categories, tags } = fields;

      if (body) {
        oldBlog.excerpt = smartTrim(stripHtml(body), 200, ' ', ' ...');
        oldBlog.metaDescription = stripHtml(body.substring(0, 160));
      }
      // oldBlog.excerpt = smartTrim(stripHtml(body), 200, ' ', ' ...');

      if (categories) {
        oldBlog.categories = categories.split(',');
      }

      if (tags) {
        oldBlog.tags = tags.split(',');
      }

      if (files.photo) {
        if (files.photo.size > 10000000) {
          return res.status(400).json({
            error: 'Image should be less then 1mb in size'
          });
        }
        oldBlog.photo.data = fs.readFileSync(files.photo.path);
        oldBlog.photo.contentType = files.photo.type;
      }

      oldBlog.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          });
        }
        // result.photo = undefined;
        res.json(result);
      });
    });
  });
}

exports.photo = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Blog.findOne({ slug })
    .select('photo')
    .exec((err, blog) => {
      if (err || !blog) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.set('Content-Type', blog.photo.contentType);
      return res.send(blog.photo.data);
    });
};


exports.listRelated = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 3;
  const { _id, categories } = req.body;
  Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
    .limit(limit)
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name profile')
    .select('title slug excerpt postedBy tags categories createdAt updatedAt')
    .exec((err, blogs) => {
      if (err) {
        return res.status(400).json({
          error: 'Blogs not found'
        });
      }
      res.json(blogs);
    });
};





exports.listSearch = (req, res) => {
  const { value } = req.query
  console.log(req.query)
  if (value) {
    Blog.find({ $or: [{ title: { $regex: value, $options: 'i' } }, { body: { $regex: value, $options: 'i' } }] }, (err, blogs) => {
      if (err) {
        return status(400).json({
          error: errorHandler(err)
        })
      }
      res.json(blogs)
    }).select('-photo -body')
  }
}

















