const UserPoint = require('../models/UserPoint')
const UserPointHistory = require('../models/UserPointHistory')
const User = require('../models/User')

function calculateDailyPoint(lastClickTime, currentTime) {
  const DAY_MS = 24 * 60 * 60 * 1000; // 하루 = 86400000ms
  const targetTime = lastClickTime + DAY_MS;
  const delta = Math.abs(currentTime - targetTime);

  if (delta >= DAY_MS) return 1.00;

  const score = 100 - (delta / DAY_MS) * (100 - 1);
  return Math.round(score * 100) / 100; // 소수점 둘째 자리까지
}


exports.record = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: '인증 정보가 없습니다.' });
  }

  const userId = req.user.id; // 인증 미들웨어로 사용자 ID 획득
  const now = Date.now(); // 서버 시간 기준

  const userExists = await User.findById(userId);
  if (!userExists) {
    return res.status(404).json({ message: '존재하지 않는 사용자입니다.' });
  }

  let user = await UserPoint.findOne({ userId });

  if (!user) {
    // 첫 클릭인 경우
    user = new UserPoint({
      userId,
      lastClickTime: now,
      totalPoint: 100,
      lastRecordPoint: 100,
      totalCount: 1
    });
    await user.save();

    await UserPointHistory.create({
      userId,
      point: 100,
      savePoint: 100,
      prevPoint: 0,
      order: 1
    });
    return res.json({ message: '첫 클릭 성공', point: 100, totalPoint: 100, totalCount: 1 });
  }

  // const DAY_MS = 24 * 60 * 60 * 1000;
  // const nextAllowedTime = user.lastClickTime + DAY_MS;

  // if (now < nextAllowedTime) {
  //   const remaining = nextAllowedTime - now;
  //   return res.status(429).json({ message: `아직 ${Math.ceil(remaining / 60000)}분 남았습니다.` });
  // }

  const lastClickDate = new Date(user.lastClickTime);
  const currentDate = new Date(now);

  const lastClickDayStr = lastClickDate.toISOString().split('T')[0];
  const currentDayStr = currentDate.toISOString().split('T')[0];

  if (lastClickDayStr === currentDayStr) {
    return res.status(429).json({ message: '오늘은 이미 클릭했습니다.' });
  }


  const point = calculateDailyPoint(user.lastClickTime, now);

  await UserPointHistory.create({
    userId,
    point: point,
    savePoint: user.totalPoint + point,
    prevPoint: user.totalPoint,
    order: user.totalCount + 1
  });


  user.totalPoint += point;
  user.totalCount += 1
  user.lastRecordPoint = point;
  user.lastClickTime = now;
  await user.save();


  res.json({
    message: '클릭 성공',
    point,
    totalPoint: user.totalPoint,
    totalCount: user.totalCount
  });
}

exports.read = async (req, res, next) => {
  try {
    const userPoints = await UserPointHistory.find({
      userId: req.params.userId
    })
    res.json(userPoints)
  } catch (err) {
    res.status(500).json({ message: err?.message })
  }
}