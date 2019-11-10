const { check } = require('express-validator');

exports.profileUpdate = [
  check('email')
    .isEmail()
    .withMessage('must be a valid email adress')
]
