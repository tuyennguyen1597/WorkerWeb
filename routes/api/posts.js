const express = require('express');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');

const router = express.Router();

//@route    Post api/posts
//@desc     Create a post
//@access   Private
router.post('/', [auth, [
    check('text', 'Text is required').notEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = {
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar
        };
        const post = await Post.create(newPost);
        return res.json(post);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

//@route    GET api/posts
//@desc     Get all post
//@access   Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        return res.json(posts);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

//@route    GET api/posts/:id
//@desc     Get post by id
//@access   Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }
        return res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        return res.status(500).send('Server error');
    }
});

//@route    DELETE api/posts/:id
//@desc     Delete a post
//@access   Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Check the owner of the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorised' })
        }
        await Post.findByIdAndRemove(req.params.id);
        return res.json({ msg: 'Post removed' })
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        return res.status(500).send('Server error');
    }
});

//@route    PUT api/posts/like/:id
//@desc     Like a post
//@access   Public
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.likes.filter(like => like.user.toString() == req.user.id).length > 0) {
            return res.json({ msg: "Already liked" });
        }
        post.likes.unshift({ user: req.user.id });
        await post.save();
        return res.json(post);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error')
    }
});

//@route    PUT api/posts/dislike/:id
//@desc     Dislike a post
//@access   Public
router.put('/dislike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            post.likes.splice(req.user.id, 1);
            await post.save();
            return res.json(post);
        }
        return res.json({ msg: 'Post has not been liked yet' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

//@route    POST api/posts/comment/:id
//@desc     Comment a post
//@access   Private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').notEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        console.log(user.name);
        const newComment = {
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar
        }
        const post = await Post.findById(req.params.id);
        post.comments.unshift(newComment);
        await post.save();
        return res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
})

//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     Remove comment
//@access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const comment = post.comments.find(comment => comment.id.toString() === req.params.comment_id);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' })
        }
        
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorised' })
        }

        const removedId = post.comments.map(comment => comment.id)
                            .indexOf(req.params.comment_id);

        post.comments.splice(removedId, 1);
        await post.save();

        return res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Comment not found' })
        }
        return res.status(500).send('Server error');
    }
})

module.exports = router;