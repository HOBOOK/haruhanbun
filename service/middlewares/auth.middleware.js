const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'haha'

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id }; // 사용자 정보 주입
    next();
  } catch (err) {
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
}

module.exports = authenticate;
