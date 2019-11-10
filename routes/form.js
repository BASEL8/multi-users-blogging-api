const express = require('express');
const router = express.Router()
const { contactForm, contactBlogAuthorForm } = require('../controller/form')
const { contactFormValidator } = require('../validators/form')
const { runValidation } = require('../validators')

router.post('/contact', contactFormValidator, runValidation, contactForm)
router.post('/contact-blog-author', contactFormValidator, runValidation, contactBlogAuthorForm)


module.exports = router;