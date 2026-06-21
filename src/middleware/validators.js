const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters.')
        .isAlphanumeric().withMessage('Username can only contain letters and numbers.'),
    body('email')
        .trim()
        .isEmail().withMessage('Must be a valid email address.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/\d/).withMessage('Password must contain at least one number.'),
    validateRequest
];

const loginValidation = [
    body('email').trim().isEmail().withMessage('Must be a valid email address.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
    validateRequest
];

module.exports = { registerValidation, loginValidation };
