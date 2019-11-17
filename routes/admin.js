const express = require('express');
const router = express.Router()
const { getGeneralData, getBlogsData, getTagsData, getCategoriesData } = require('../controller/admin')
const { requiresignin, authMiddleware, adminMiddleware } = require('../controller/auth')

router.get('/admin/data', requiresignin, adminMiddleware, authMiddleware, getGeneralData)
router.get('/admin/data/blogs/:month_/:year_', requiresignin, adminMiddleware, authMiddleware, getBlogsData)
router.get('/admin/data/tags/:month_/:year_', requiresignin, adminMiddleware, authMiddleware, getTagsData)
router.get('/admin/data/categories/:month_/:year_', requiresignin, adminMiddleware, authMiddleware, getCategoriesData)



module.exports = router;