const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    if (!req.header('Authorization')) {
      return res.status(400).json({
        ok: false,
        error: 'NoAuthHeader',
        message: 'No Authorization header set.'
      })
    }
    const token = req.header('Authorization').split(' ')[1]
    if (!token) {
      return res.status(401).json({
        ok: false,
        error: 'EmptyToken',
        message: 'Provide an authentication token by logging in.'
      })
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if (!verified) {
      return res.status(401).json({
        ok: false,
        error: 'Unauthorized',
        message: 'Please login with correct credentials.'
      })
    }
    const user = await User.findOne({ _id: verified.id })
    if (!user) {
      return res.status(400).json({
        ok: false,
        error: 'NoAcc',
        message: 'No Account exists with this email.'
      })
    }
    req.user = { id: verified.id, email: verified.email }
    next()
  } catch (error) {
    res.status(500).json({
      ok: false,
      error
    })
  }
}

module.exports = auth