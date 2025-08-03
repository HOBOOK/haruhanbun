const User = require('../models/User')
const UserPoint = require('../models/UserPoint')


exports.get = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const [ranked, total] = await Promise.all([
      UserPoint.find({})
        .sort({ totalPoint: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatarUrl') 
        .lean(),
      UserPoint.estimatedDocumentCount()
    ]);

    // 필요한 데이터만 추려서 리턴
    const users = ranked.map(entry => ({
      userId: entry.userId._id,
      name: entry.userId.name,
      avatarUrl: entry.userId.avatarUrl,
      point: parseFloat(entry.totalPoint.toFixed(2)) 
    }));

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users
    });
  } catch (err) {
    next(err);
  }
};
