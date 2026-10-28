const bcrypt = require('bcryptjs');
const User = require('../model/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// POST /auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, adminKey } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

  const role =
    adminKey && process.env.ADMIN_SECRET_KEY && adminKey === process.env.ADMIN_SECRET_KEY
      ? 'admin'
      : 'user';

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });

  res.status(201).json({
    success: true,
    message: 'Registered successfully',
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  res.json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const u = req.user;
  res.json({ success: true, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
});
