const express = require('express');
const router = express.Router()
const { requiresignin, authMiddleware, adminMiddleware } = require('../controller/auth')
const { read, publicProfile, updateProfile, photo, deleteMyProfile, getAllUsers, AdminRemoveUser } = require('../controller/user')
const { profileUpdate } = require('../validators/user')
const { runValidation } = require('../validators')

router.get('/profile', requiresignin, authMiddleware, read)
router.get('/profile/:username', publicProfile)
router.put('/profile/update', requiresignin, authMiddleware, updateProfile)
router.get('/profile/photo/:username', requiresignin, authMiddleware, photo)
router.post('/delete-my-account', requiresignin, authMiddleware, deleteMyProfile)
router.post('/get-all-users', requiresignin, authMiddleware, adminMiddleware, getAllUsers)
router.delete('/remove-user/:userId', requiresignin, authMiddleware, adminMiddleware, AdminRemoveUser)
module.exports = router;