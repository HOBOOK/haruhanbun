const { OAuth2Client } = require('google-auth-library')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const UserPoint = require('../models/UserPoint')
const express = require('express');
const router = express.Router();

const CLIENT_ID = '882327378871-mcf2sdkt29cm1sb68ipkgo9mt4l8iovd.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID)
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'haha-access-secret'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'haha-refresh-secret'

router.post('/google', async (req, res) => {
  const { idToken } = req.body
  try {
    // 1. Google 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: CLIENT_ID
    })
    const payload = ticket.getPayload()
    const { email, name, picture } = payload

    // 2. 사용자 DB 확인
    let user = await User.findOne({ email })

    // 3. 없으면 자동 회원가입
    if (!user) {
      user = await User.create({
        email,
        name,
        picture,
        provider: 'google'
      })
    }

    const userPoint = await UserPoint.findOne({ userId: user._id }).lean();

    // 4. JWT 발급
    const accessToken = jwt.sign({ id: user._id, email: user.email }, ACCESS_SECRET, { expiresIn: '30m' })
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '7d' })

    user.refreshToken = refreshToken
    await user.save()

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // 배포 시 true
      path: '/auth/refresh'
    })

    res.json({
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        ...user.toObject(),
        totalPoint: userPoint?.totalPoint || 0,
        totalCount: userPoint?.totalCount || 0,
        lastClickTime: userPoint?.lastClickTime || 0,
        lastRecordPoint: userPoint?.lastRecordPoint || 0
      }
    })
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: 'Invalid Google token' })
  }
})

router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken

  if (!token) return res.sendStatus(401)

  jwt.verify(token, REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403)

    const user = await User.findOne({_id: decoded.id , refreshToken: token})
    if (!user) return res.sendStatus(403)

    const newAccessToken = jwt.sign({ id: user._id, email: user.email }, ACCESS_SECRET, { expiresIn: '30m' })
    res.json({ token: newAccessToken })
  })
})

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET)
    const user = await User.find({ email: decoded.email })
    res.json(user)
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/auth/refresh'
  })
  return res.json({ message: 'Logged out' })
})

module.exports = router;