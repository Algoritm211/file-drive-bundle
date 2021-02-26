const config = require('config')
const fs = require('fs')



class FileService {

  createDir(request, file) {
    const filePath = `${request.filePath}/${file.user}/${file.path}`

    return new Promise((resolve, reject) => {

      try {
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath)
          return resolve({message: 'File was created successfully'})
        } else {
          return reject({message: 'File already exist'})
        }
      } catch (error) {
        console.log(error)
        return reject({message: 'File Error'})
      }

    })
  }

  deleteFile(request, file) {
    const path = this._getFilePath(request, file)

    if (file.type === 'dir') {
      fs.rmdirSync(path)
    } else {
      fs.unlinkSync(path)
    }

  }

  _getFilePath(request, file) {
    return `${request.filePath}/${file.user}/${file.path}`
  }
}


module.exports = new FileService()
