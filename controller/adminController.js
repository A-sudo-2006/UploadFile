const Post = require('../model/Post');
const asyncHandler = require('../utils/asyncHandler');

// GET /admin/posts/pending
exports.getPendingPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: 'pending' })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: posts.length, posts });
});

const review = (newStatus) =>
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.status !== 'pending') {
      return res
        .status(400)
        .json({ success: false, message: `Only pending posts can be reviewed (current: ${post.status})` });
    }
    post.status = newStatus;
    await post.save();
    res.json({ success: true, message: `Post ${newStatus}`, post });
  });

// PATCH /admin/posts/approve/:id
exports.approvePost = review('approved');
// PATCH /admin/posts/reject/:id
exports.rejectPost = review('rejected');
