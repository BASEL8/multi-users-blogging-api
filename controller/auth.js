const User = require('../models/user');
const shortId = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } = require('../helpers/dbErrorHandler')
const _ = require('lodash')
const { OAuth2Client } = require('google-auth-library')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
var text2png = require('text2png');



exports.preSignup = (req, res) => {
  const { email, password, name } = req.body;
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (user) {
      return res.status(400).json({
        error: 'Email is token'
      })
    }
    const token = jwt.sign({ email, password, name }, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, { expiresIn: '1d' })
    const emailData = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: `Activation link`,
      html: `
    <h4>please use this link to activate you account<h4> 
    <a href="${process.env.CLIENT_URL}/auth/activate/${token}">activate-link</a>
    `
    }

    sgMail.send(emailData).then(sent => {
      return res.json({
        success: `activation link has been sent to ${email}`
      })
    })
  })
}
exports.signup = (req, res) => {

  const { activationToken } = req.body
  console.log(activationToken)
  if (activationToken) {
    jwt.verify(activationToken, process.env.JWT_ACCOUNT_ACTIVATION_SECRET, function (err, decoded) {
      if (err) {
        return res.status(400).json({
          error: 'link is expired'
        })
      } else {
        console.log(decoded)
        const { email, password, name } = decoded
        let username = shortId.generate();
        let profile = `${process.env.CLIENT_URL}/profile/${username}`;
        let photo = {}
        photo.data = text2png(name[0].toUpperCase(), { color: 'black', textAlign: 'center', lineSpacing: 10, padding: 20 });
        let newUser = new User({ name, email, password, profile, username, photo });
        newUser.save((err, user) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err)
            })
          }
          const name = user.name;
          const email = user.email
          res.json({ success: 'Signup success! please login', name, email })
        })

      }
    })
  } else {
    return res.status(400).json({
      error: 'something went wrong, please try agin later'
    })
  }


}
exports.signin = (req, res) => {
  const { email, password } = req.body
  //check if user exist
  console.log(req.body)
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with this email dose not exist, Please signup'
      })
    }
    //authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: 'Email and Password do not match'
      })
    }
    //generate a token send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { expiresIn: '1d' })
    const { _id, username, name, email, role, photo } = user;
    res.json({
      token,
      user: {
        _id, username, name, email, role, photo
      }
    })
  })
}
exports.signOut = (req, res) => {
  res.clearCookie('token');
  res.json({
    message: 'signout success'
  })
}
exports.requiresignin = expressJwt({
  secret: process.env.JWT_SECRET
})
exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      })
    }
    req.profile = user;
    next();
  })
}
exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      })
    }
    if (user.role !== 1) {
      return res.status(400).json({
        error: 'admin resource access denied'
      })
    }
    req.profile = user;
    next();
  })
}
exports.forgetPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        error: 'user with this email dose not found'
      })
    } else if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_resetPassword_SECRET, { expiresIn: '10m' })
      //send email 
      const emailData = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: `Password reset link`,
        html: `
    <h4>please use this link to reset your password<h4> 
    <a href="${process.env.CLIENT_URL}/auth/password/reset/${token}">reset-link</a>
    `
      }
      return user.updateOne({ resetPassword: token }, (err, success) => {
        if (err) {
          return res.json({
            error: err
          })
        }
        sgMail.send(emailData).then(sent => {
          return res.json({
            message: `Email has been sent to ${email}, follow the instruction to reset your password, the link expire in 10 min`
          })
        })
      })
    }

  })

}
exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_resetPassword_SECRET, function (err, decoded) {
      if (err) {
        return res.status(401).json({
          error: 'expired link'
        })
      } else {
        User.findOne({ resetPassword: resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(401).json({
              error: 'something went wrong, please try later'
            })
          }
          else {
            const updatedFields = {
              password: newPassword,
              resetPassword: ''
            }
            user = _.extend(user, updatedFields)
            user.save((err, success) => {
              if (err) {
                return res.status(400).json({
                  error: errorHandler(err)
                })
              }
              res.json({
                email: user.email,
                message: 'now you can login with your new password'
              })
            })
          }
        })
      }
    })
  }
  res.status(200)
}

const clint = new OAuth2Client(process.env.GOOGLE_CLINT_ID)
exports.googleSignin = (req, res) => {
  const idToken = req.body.tokenId;
  clint.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLINT_ID }).then(response => {
    const { email_verified, name, email, jti, picture } = response.payload
    if (email_verified) {
      User.findOne({ email }, (err, user) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          })
        }
        if (user) {
          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
          res.cookie('token', token, { expiresIn: '1d' })
          const { _id, email, name, role, username, photo } = user;
          res.status(200).json({
            token,
            user: { _id, email, name, role, username, photo }
          })
        } else {
          let username = shortId.generate();
          let profile = `${process.env.CLIENT_URL}/profile/${username}`
          let password = jti;
          user = new User({ name, email, password, profile, username })
          user.save((err, data) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err)
              })
            } else {
              const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
              res.cookie('token', token, { expiresIn: '1d' })
              const { _id, email, name, role, username, photo } = data;
              res.json({
                token,
                user: { _id, email, name, role, username, photo }
              })
            }
          })
        }
      })
    } else {
      return res.status(400).json({
        error: 'google login failed,please try agin'
      })
    }

  })

}
