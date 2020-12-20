const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const config = require('config')
const request = require('request');

const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const User = require('../../models/User');

const router = express.Router();

//@route    GET api/profiles/me
//@desc     Get the current user profile
//@access   Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).send('There is no profile for this user!');
        }
        return res.json(profile);
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
                { user: req.user.id },
                profileFields,
                { new: true }
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
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
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
        //Remove user's posts
        await Post.deleteMany({ user: req.user.id})

        //Profile remove
        await Profile.findOneAndRemove({ user: req.user.id });

        //User remove
        await User.findByIdAndRemove({ _id: req.user.id })
        return res.send('User deleted')
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
})

//@route    PUT api/profiles/experience
//@desc     Update user experience
//@access   Private
router.put('/experience', [auth, [
    check('title', 'Title is required').notEmpty(),
    check('company', 'Company is required').notEmpty(),
    check('from', 'From date is required').notEmpty(),
]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return req.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp);
            await profile.save();
            return res.json(profile);
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    });

//@route    DELETE api/profiles/experience/:exp_id
//@desc     Delete user experience
//@access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //Find remove index
        const removedId = profile.experience.map(exp => exp.id).indexOf(req.params.exp_id);
console.log(removedId)
        profile.experience.splice(removedId, 1);
console.log(profile.experience)
        await profile.save();
        return res.json(profile);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

//@route    PUT api/profiles/education
//@desc     Update user education
//@access   Private
router.put('/education', [auth, [
    check('school', 'School is required').notEmpty(),
    check('degree', 'Degree is required').notEmpty(),
    check('fieldofstudy', 'Field of study is required').notEmpty(),
    check('from', 'From date is required').notEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });

        profile.education.unshift(newEdu);

        await profile.save();

        return res.json(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

//@route    DELETE api/profiles/education/:edu_id
//@desc     Delete user education
//@access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //Find remove education id
        const removedId = profile.education.map(edu => edu.id).indexOf(req.params.edu_id);

        profile.education.splice(removedId, 1);

        await profile.save();

        return res.json(profile);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

//@route    GET api/profiles/github/:username
//@desc     Get user repos from git hub
//@access   Public
router.get('/github/:username', (req, res) => {
    const option = {
        uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientID')}&client_secret=${config.get('githubClientSecret')}`,
        method: 'GET',
        headers: { 'user-agent': 'node.js' }
    };

    request(option, (error, response, body) => {
        if (error) console.error(error);

        if (response.statusCode !== 200) {
            console.log(response);
            return res.status(404).json({ msg: 'No github profile found' });
        }

        return res.json(JSON.parse(body))
    })
});

module.exports = router;