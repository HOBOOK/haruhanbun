const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'haha-access-secret'

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다.' });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET, { clockTolerance: 5 });
    req.user = { id: payload.id }; // 사용자 정보 주입
    next();
  } catch (err) {
    // ❗ 만료/위조된 토큰 → 401로 통일
    console.warn(err)
    return res.status(401).json({ message: '토큰이 유효하지 않거나 만료되었습니다.' });
  }
}

module.exports = authenticate;
