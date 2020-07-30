const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

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

//@route    POST api/profiles
//@desc     Create or upload user profile
//@access   Private
router.post('/', [auth, [
    check('status', 'Status is required').notEmpty(),
    check('skills', 'Skill is required').notEmpty()
]], async (req, res) => {
    try {
        //Check user input error
        const error = validationResult(req)
        if (!error.isEmpty()) {
            return res.status(400).json({ errors: error.array() })
        }

        const {
            company,
            website,
            location,
            status,
            skills,
            bio,
            githubusername,
            experience,
            education,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook
        } = req.body;
        
        //Make profile object
        const profileFields = {}

        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (status) profileFields.status = status;
        if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());
        if (bio) profileFields.bio = bio;
        if (githubusername) profileFields.githubusername = githubusername;
        if (experience) profileFields.experience = experience;
        if (education) profileFields.education = education;

        //Build social object
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;

        const userProfile = await Profile.findOne({ user: req.user.id })
                            .populate('user', ['name', 'avatar']);
        let profile;
        if (userProfile) {
            profile = await Profile.findOneAndUpdate(
                {user: req.user.id},
                profileFields,
                {new: true}
            )
        } else { 
            console.log("No user profile")
            profile = await new Profile(profileFields);
            await profile.save();
        }
        return res.json(profile);
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Server error');
    }
});

//@route    GET api/profiles
//@desc     Get all profiles
//@access   Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find({}).populate('user', ['name', 'avatar']);
        return res.json(profiles);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
    
})

//@route    GET api/profiles/user/:user_id
//@desc     Get profile by user id
//@access   Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id})
                        .populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: "Profile not found" });
        }
        return res.json(profile);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

//@route    DELETE api/profiles
//@desc     Delete profile and user
//@access   Private
router.delete('/', auth, async (req, res) => {
    try {
        //@todo make a remove for posts

        //Profile remove
        await Profile.findOneAndRemove({user: req.user.id});

        //User remove
        await User.findByIdAndRemove({_id: req.user.id})
        return res.send('User deleted')
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
})

module.exports = router;