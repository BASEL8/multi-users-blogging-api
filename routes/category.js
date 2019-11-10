const express = require('express');
const router = express.Router()
const { create, read, remove, list } = require('../controller/category')
const { runValidation } = require('../validators')
const { categoryCreateValidator } = require('../validators/category')
const { adminMiddleware, requiresignin } = require('../controller/auth')

router.post('/category', categoryCreateValidator, runValidation, requiresignin, adminMiddleware, create)
router.get('/categories', list)
router.get('/category/:slug', read)
router.delete('/category/:slug', requiresignin, adminMiddleware, remove)

module.exports = router;