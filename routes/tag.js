const express = require('express');
const router = express.Router()
const { create, read, remove, list } = require('../controller/tag')
const { runValidation } = require('../validators')
const { tagCreateValidator } = require('../validators/tag')
const { adminMiddleware, requiresignin } = require('../controller/auth')

router.post('/tag', tagCreateValidator, runValidation, requiresignin, adminMiddleware, create)
router.get('/tags', list)
router.get('/tag/:slug', read)
router.delete('/tag/:slug', requiresignin, adminMiddleware, remove)

module.exports = router;