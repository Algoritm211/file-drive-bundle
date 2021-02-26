

module.exports = function fileMiddleware(path) {
  return (request,response ,next) => {
    try {
      request.filePath = path
      next()
    } catch (e) {
      console.log(e)
    }

  }
}
