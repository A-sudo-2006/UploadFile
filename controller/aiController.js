const Post = require('../model/Post');
const asyncHandler = require('../utils/asyncHandler');
const { improveContent } = require('../services/aiService');

// POST /ai/improve/:postId
// Improves content with Gemini and saves as a NEW draft (original untouched)
exports.improvePost = asyncHandler(async (req, res) => {
  const original = await Post.findById(req.params.postId);
  if (!original) return res.status(404).json({ success: false, message: 'Post not found' });
  if (original.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'You can only improve your own posts' });
  }

  let improved;
  try {
    improved = await improveContent(original);
  } catch (err) {
    return res.status(502).json({ success: false, message: `AI service error: ${err.message}` });
  }

  const newDraft = await Post.create({
    title: improved.title,
    description: improved.description,
    content: improved.content,
    image: original.image,
    category: original.category,
    createdBy: req.user._id,
    status: 'draft',
  });

  res.status(201).json({
    success: true,
    message: 'AI-improved version saved as a new draft',
    originalPostId: original._id,
    post: newDraft,
  });
});
