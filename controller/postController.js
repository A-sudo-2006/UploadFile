const Post = require('../model/Post');
const asyncHandler = require('../utils/asyncHandler');

const USER_EDITABLE_STATUS = ['draft', 'pending'];

// POST /posts  -> create post (status: "draft" or "pending")
exports.createPost = asyncHandler(async (req, res) => {
  const { title, description, content, image, category, status } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'title and content are required' });
  }
  if (status && !USER_EDITABLE_STATUS.includes(status)) {
    return res.status(400).json({ success: false, message: 'status must be "draft" or "pending"' });
  }
  const post = await Post.create({
    title, description, content, image, category,
    status: status || 'draft',
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, post });
});

// GET /posts -> all approved posts
exports.getApprovedPosts = asyncHandler(async (req, res) => {
  const filter = { status: 'approved' };
  if (req.query.category) filter.category = req.query.category;
  const posts = await Post.find(filter).populate('createdBy', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, count: posts.length, posts });
});

// GET /posts/my-posts
exports.getMyPosts = asyncHandler(async (req, res) => {
  const filter = { createdBy: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const posts = await Post.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: posts.length, posts });
});

// GET /posts/:id -> approved post by id
exports.getApprovedPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: 'approved' }).populate('createdBy', 'name email');
  if (!post) return res.status(404).json({ success: false, message: 'Approved post not found' });
  res.json({ success: true, post });
});

// PATCH /posts/:id -> update own post
exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (post.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'You can only update your own posts' });
  }

  const { title, description, content, image, category, status } = req.body;
  if (status && !USER_EDITABLE_STATUS.includes(status)) {
    return res.status(400).json({ success: false, message: 'status must be "draft" or "pending"' });
  }

  if (title !== undefined) post.title = title;
  if (description !== undefined) post.description = description;
  if (content !== undefined) post.content = content;
  if (image !== undefined) post.image = image;
  if (category !== undefined) post.category = category;

  if (status) {
    post.status = status;
  } else if (post.status === 'approved' || post.status === 'rejected') {
    // editing a reviewed post sends it back to draft
    post.status = 'draft';
  }

  await post.save();
  res.json({ success: true, post });
});

// DELETE /posts/:id -> delete own post
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (post.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'You can only delete your own posts' });
  }
  await post.deleteOne();
  res.json({ success: true, message: 'Post deleted' });
});
