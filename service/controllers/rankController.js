const User = require('../models/User')

exports.get = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100); // 최대 100
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const projection = 'name point avatarUrl';

    const [users, total] = await Promise.all([
      User.find({}, projection)
        .sort({ point: -1, _id: 1 }) // point 높은 순
        .skip(skip)
        .limit(limit)
        .lean(),
      User.estimatedDocumentCount(),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    next(err);
  }
}