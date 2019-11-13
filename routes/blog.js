const express = require('express');
const router = express.Router()
const { create, list, listAllBlogsCategoriesTgs, read, adminRemoveBlog, userRemoveBlog, update, photo, listRelated, readPart, listUserPlogs, listSearch } = require('../controller/blog')
const { requiresignin, authMiddleware, adminMiddleware } = require('../controller/auth')

router.post('/blog', requiresignin, create)
router.get('/blogs', requiresignin, adminMiddleware, list)
router.post('/user/blogs', requiresignin, listUserPlogs)
router.post('/blogs-categories-tags', listAllBlogsCategoriesTgs)
router.get('/blog/:slug', requiresignin, read)
router.post('/blog/part/:slug', readPart)
router.delete('/blog/adminRemoveBlog/:slug', requiresignin, adminMiddleware, adminRemoveBlog)
router.delete('/blog/userRemoveBlog/:slug', requiresignin, userRemoveBlog)
router.put('/blog/:slug', requiresignin, update)
router.get('/blog/photo/:slug', photo);
router.get('/blogs/search', listSearch);
router.post('/blogs/related', listRelated);


module.exports = router;