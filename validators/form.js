const { check } = require('express-validator');

exports.contactFormValidator = [
  check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
  check('email')
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('must be valid email adress'),
  check('message')
    .not()
    .isEmpty()
    .isLength({ min: 20 })
    .withMessage('must be at least 20 characters long')
]