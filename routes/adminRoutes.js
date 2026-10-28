const router = require('express').Router();
const c = require('../controller/adminController');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(protect, adminOnly);

router.get('/posts/pending', c.getPendingPosts);
router.patch('/posts/approve/:id', c.approvePost);
router.patch('/posts/reject/:id', c.rejectPost);

module.exports = router;
