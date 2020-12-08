const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  productId: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, default: 1 },
  price: { type: mongoose.Types.Decimal128, required: true },
  dateCreated: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Order', orderSchema)