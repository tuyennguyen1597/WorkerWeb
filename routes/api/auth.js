const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

//@route    GET api/auth
//@desc     Test route
//@access   Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json( { user });
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error');
    }
});

//@route    POST api/auth
//@desc     User login and get token
//@access   Public
router.post(
    '/',
    [
        check('email', 'Email is required'
        ).notEmpty()
            .isEmail()
            .withMessage('Invalid Email'),
        check(
            'password',
            'Password required'
        ).exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        //mongodb, bcryptjs will return a promise
        //which return promise must use async and await or then and catch
        try {
            //Get registered user email, password
            const { email, password } = req.body;
            
            //Check whether user exists
            let user = await User.findOne( { email } );
            if ( !user ) {
                return res.status(400).json({ error: [{ msg: "Invalid credentials" }]});
            } else {
                //Check password validation
                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return res.status(400).json({ error: [{ msg: "Invalid credentials" }]}); 
                }

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