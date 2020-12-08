const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }

const userRouter = require('./routers/userRouter')
const orderRouter = require('./routers/orderRouter')

//connect to local mongodb
const uri = `mongodb+srv://taskapp:${process.env.MONGOOSE_KEY}@cluster0.vamq0.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}, function (error) {
  if (error) {
    throw new Error(error.message)
  }
});

//setup express app
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

//setup routes
app.use('/users', userRouter)
app.use('/orders', orderRouter)

//When no route matches
app.use((req, res, next) => {
  const error = new Error('Url Not found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

//starting servr
app.listen(port, () => console.log(`Server listening at ${port}`))