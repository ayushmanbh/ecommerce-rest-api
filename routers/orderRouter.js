const express = require('express')
const router = express.Router()
const Order = require('../models/Orders')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
    if (orders.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "You have no pending orders"
      })
    }
    res.status(200).json({
      ok: true,
      message: 'Your Cart items',
      orders
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message
    })
  }
})

module.exports = router