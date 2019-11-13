const express = require('express');
const router = express.Router()
const { requiresignin, authMiddleware } = require('../controller/auth')
const { read, publicProfile, updateProfile, photo, deleteMyProfile } = require('../controller/user')
const { profileUpdate } = require('../validators/user')
const { runValidation } = require('../validators')

router.get('/profile', requiresignin, authMiddleware, read)
router.get('/profile/:username', publicProfile)
router.put('/profile/update', requiresignin, authMiddleware, updateProfile)
router.get('/profile/photo/:username', requiresignin, authMiddleware, photo)
router.post('/delete-my-account', requiresignin, authMiddleware, deleteMyProfile)
module.exports = router;