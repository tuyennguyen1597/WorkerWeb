const express = require('express');
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');

const router = express.Router();

//@route    GET api/profiles/me
//@desc     Get the current user profile
//@access   Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(400).send('There is no profile for this user!');
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error');
    }
});

module.exports = router;