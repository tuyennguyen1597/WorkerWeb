const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();

//@route    POST api/users
//@desc     Test route
//@access   Public
router.post(
    '/',
    [
        check('name', 'Name is required').notEmpty(),
        check('email', 'Email is required'
        ).notEmpty()
            .isEmail()
            .withMessage('Invalid Email'),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({
            min: 6,
        }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        res.send('Users route');
    }
);

module.exports = router;
