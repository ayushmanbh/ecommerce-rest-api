const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const User = require('../models/User')

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, passwordCheck } = req.body

    //validation
    if (!username || !email || !password || !passwordCheck) {
      return res.status(400).json({
        ok: false,
        message: "Please enter the required values."
      })
    }
    if (password.length < 8) {
      return res.status(400).json({
        ok: false,
        message: 'Password should be atleast 8 characters long.'
      })
    }
    if (password !== passwordCheck) {
      return res.status(400).json({
        ok: false,
        message: 'Please confirm the correct password.'
      })
    }
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        ok: false,
        message: 'An account with this email already exists. Please use another email.'
      })
    }

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    })
    const savedUser = await newUser.save()
    res.status(200).json({
      ok: true,
      message: 'User has been saved',
      user: {
        username: savedUser.username,
        email: savedUser.email
      }
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Please enter the required values."
      })
    }
    const existingUser = await User.findOne({ email })
    if (!existingUser) {
      return res.status(400).json({
        ok: false,
        message: 'No account with this email exists. Please register first.'
      })
    }
    const isMatched = await bcrypt.compare(password, existingUser.password)
    if (!isMatched) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid credentials.'
      })
    }
    const token = jwt.sign({ id: existingUser._id, email: existingUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.status(200).json({
      ok: true,
      message: 'Successfully logged in.',
      token,
      user: {
        displayName: existingUser.username,
        id: existingUser._id
      }
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message
    })
  }
})

router.delete('/delete', auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id)
    res.status(200).json({
      ok: true,
      message: `User with email: ${deletedUser.email} has been deleted`
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message
    })
  }
})

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (error) {
    res.status(500).json({ error });
  }
})

router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    displayName: user.username,
    id: user._id,
  });
})

module.exports = router