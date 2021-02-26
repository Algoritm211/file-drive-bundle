const Router = require('express')
const User = require('../models/User')
const FileService = require('../services/fileService')
const File = require('../models/File')
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')
const JWT = require('jsonwebtoken')
const config = require('config')
const router = new Router()
const authMiddleware = require('../middlewares/auth.middleware')


router.post('/registration',
  [
    check('email', 'This must be valid Email').isEmail(),
    check('password', 'Password must be 3 min and 12 max symbols').isLength({min: 3, max: 12})
  ],
  async (request, response) => {
    try {
      const errorsValidation = validationResult(request)

      if (!errorsValidation.isEmpty()) {
        return response.status(400).json({message: 'Incorrect Validation', errors: errorsValidation})
      }
      const {email, password} = request.body

      const person = await User.findOne({email: email})
      // console.log(person)

      if (person) {
        return response.status(400).json({message: `This user with email ${email} already exist`})
      }

      const hashPassword = await bcrypt.hash(password, 8)
      const user = new User({email: email, password: hashPassword})
      await FileService.createDir(request, new File({user: user._id, path: ''}))
      await user.save()
      return response.status(200).json({message: 'User created successfully'})

    } catch (error) {
      console.log(error)
      response.send({'ServerError': error})
    }
  })


router.post('/login', async (request, response) => {

  try {

    const {email, password} = request.body
    const user = await User.findOne({email: email})

    if (!user) {
      return response.status(400).json({message: 'User does not exist'})
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return response.status(400).json({message: 'Invalid password'})
    }

    const token = JWT.sign({id: user.id}, config.get('secretKey'), {expiresIn: '1h'})
    return response.json({
      token: token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        avatar: user.avatar,
        files: user.files
      }
    })
  } catch (error) {
    return response.send('Server Error')
  }
})


router.get('/authorization', authMiddleware, async (request, response) => {

  try {

    const user = await User.findOne({_id: request.user.id})

    if (!user) {
      return response.status(401).json({message: 'This user was not found'})
    }

    const token = JWT.sign({id: user.id}, config.get('secretKey'), {expiresIn: '1h'})
    return response.json({
      token: token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        avatar: user.avatar,
        files: user.files
      }
    })

  } catch (error) {
    response.send({message: "Server Error"})
  }
})

module.exports = router
