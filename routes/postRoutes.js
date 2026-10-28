const router = require('express').Router();
const c = require('../controller/postController');
const { protect } = require('../middleware/auth');

router.post('/', protect, c.createPost);
router.get('/', c.getApprovedPosts);
// NOTE: /my-posts must be declared before /:id
router.get('/my-posts', protect, c.getMyPosts);
router.get('/:id', c.getApprovedPostById);
router.patch('/:id', protect, c.updatePost);
router.delete('/:id', protect, c.deletePost);

module.exports = router;
