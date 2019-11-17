const express = require('express');
const router = express.Router()
const { getGeneralData, getBlogsData } = require('../controller/admin')
const { requiresignin, authMiddleware, adminMiddleware } = require('../controller/auth')

router.get('/admin/data', requiresignin, adminMiddleware, authMiddleware, getGeneralData)
router.get('/admin/data/blogs', requiresignin, adminMiddleware, authMiddleware, getBlogsData)



module.exports = router;