const express = require('express');
const router = express.Router()
const { preSignup, googleSignin, signup, signin, signOut, requiresignin, forgetPassword, resetPassword } = require('../controller/auth')
const { runValidation } = require('../validators')
const { userSignupValidator, userSigninValidator, forgetPasswordValidator, resetPasswordValidator } = require('../validators/auth')

router.post('/pre-signup', userSignupValidator, runValidation, preSignup)
router.post('/google-signin', googleSignin)
router.post('/signup', signup)
router.post('/signin', userSigninValidator, runValidation, signin)
router.get('/signout', signOut)
router.put('/forget-password', forgetPasswordValidator, runValidation, forgetPassword)
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword)


module.exports = router;