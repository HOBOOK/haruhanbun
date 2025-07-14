const { OAuth2Client } = require('google-auth-library')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const express = require('express');
const router = express.Router();

const CLIENT_ID = '882327378871-mcf2sdkt29cm1sb68ipkgo9mt4l8iovd.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID)
const JWT_SECRET = process.env.JWT_SECRET || 'haha'

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

    // 4. JWT 발급
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token: jwtToken, user })
  } catch (err) {
    console.error(err)
    res.status(401).json({ error: 'Invalid Google token' })
  }
})

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log(decoded)
    const user = await User.find({email: decoded.email})
    res.json(user)
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' })
  }
})
module.exports = router;