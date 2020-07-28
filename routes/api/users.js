const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require("../../models/User");
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
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        //mongodb, bcryptjs will return a promise
        //which return promise must use async and await or then and catch
        try {
            //Get registered user name, email, password
            const { name, email, password } = req.body;

            //Check whether user exists
            let user = await User.findOne( { email } );
            if ( user ) {
                res.status(400).json({ error: [{ msg: "Email has already existed" }]});
            } else {
                //Create user avatar
                let avatar = gravatar.url(email, {
                    s: '200',
                    d: 'mm',
                    r: 'pg'
                });

                //Enter user to model
                user = new User({
                    name,
                    email,
                    avatar,
                    password
                });
                
                // Encrypt password
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);

                //Save user to database
                await user.save();

                //Return jsonwebtoken
                let payload = {
                    user: {
                        id: user.id
                    }
                }

                jwt.sign(
                    payload,
                    config.get('jsonSecret'),
                    {expiresIn: 6000000},
                    (err, token) => {
                        if (err) throw err;
                        res.json( { token } )
                    });
            }

        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
        
    }
);

module.exports = router;
