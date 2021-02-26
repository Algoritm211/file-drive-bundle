const JWT = require('jsonwebtoken')
const config = require('config')


module.exports = (request, response, next) => {
  if (request.method === "OPTIONS") {
    next()
  }

  try {
    const token = request.headers.authorization.split(' ')[1] // Because returns string "Bearer ${token}"

    if (token === 'null') {
      return response.status(401).json({message: "Auth error"})
    }

    const decodedUserId = JWT.verify(token, config.get('secretKey'))

    request.user = decodedUserId
    next()
  } catch (error) {
    console.log(error)
  }
}
