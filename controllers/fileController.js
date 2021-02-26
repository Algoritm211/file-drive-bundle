const FileService = require('../services/fileService')
const User = require('../models/User')
const config = require('config')
const File = require('../models/File')
const fs = require("fs");

class FileController {
  async createDir(request, response) {

    try {
      const {name, type, parent} = request.body

      const file = new File({type, name, parent, user: request.user.id})
      const fileParent = await File.findOne({_id: parent})

      if (!fileParent) {
        file.path = name
        await FileService.createDir(request, file)
      } else {
        file.path = `${fileParent.path}/${name}`
        await FileService.createDir(request, file)
        fileParent.children.push(file._id)
        await fileParent.save()
      }

      await file.save()
      return response.status(200).json(file)
    } catch (error) {
      console.log(error)
      return response.status.json({message: 'Server Error'})
    }
  }

  async getFiles(request, response) {
    try {
      const sortType = request.query.sort

      let files
      switch (sortType) {
        case 'size':
          files = await File.find({user: request.user.id, parent: request.query.parent}).sort({size: 1})
          break
        case 'name':
          files = await File.find({user: request.user.id, parent: request.query.parent}).sort({name: 1})
          break
        case 'date':
          files = await File.find({user: request.user.id, parent: request.query.parent}).sort({date: 1})
          break
        default:
          files = await File.find({user: request.user.id, parent: request.query.parent})
      }

      return response.json(files)

    } catch (error) {
      console.log(error)
      return response.status.json({message: 'File get error'})
    }
  }

  async uploadFiles(request, response) {
    try {
      const file = request.files.file

      const parent = await File.findOne({user: request.user.id, _id: request.body.parent})
      const user = await User.findOne({_id: request.user.id})

      if (user.usedSpace + file.size > user.diskSpace) {
        return response.status(400).json({message: 'You have not enough space on disk'})
      }
      user.usedSpace = user.usedSpace + file.size

      if (!parent) {
        file.path = `${request.filePath}/${user._id}/${file.name}`
      } else {
        file.path = `${request.filePath}/${user._id}/${parent.path}/${file.name}`
      }
      const type = file.name.split('.').pop()

      if (fs.existsSync(file.path)) {
        return response.status(400).json({message: 'File already exist'})
      }
      await file.mv(file.path)

      let filePath
      if (!parent) {
        filePath = file.name
      } else {
        filePath = `${parent.path}/${file.name}`
      }

      const newFile = new File({
        name: file.name,
        type: type,
        size: file.size,
        path: filePath,
        parent: parent?._id,
        user: user._id
      })

      await newFile.save()
      await user.save()

      return response.json(newFile)
    } catch (error) {
      console.log(error)
      return response.status.json({message: 'File upload error'})
    }
  }

  async downloadFile(request, response) {
    try {

      const file = await File.findOne({user: request.user.id, _id: request.query.id})

      const path = `${request.filePath}/${request.user.id}/${file.path}`

      if (!fs.existsSync(path)) {
        return response.status(400).json({message: 'File is not exist'})
      }

      return response.download(path, file.name)

    } catch (error) {
      console.log(error)
      return response.status(500).json({message: 'File download error'})
    }
  }

  async deleteFile(request, response) {
    try {
      const file = await File.findOne({_id: request.query.id})
      await FileService.deleteFile(request, file)
      await file.remove()
      response.status(200).json({id: file._id})
    } catch (error) {
      console.log(error)
      return response.status(500).json({message: 'File delete error'})
    }
  }

  async searchFile(request, response) {
    try {
      const searchString = request.query.search

      const allUsersFiles = await File.find({user: request.user.id})
      const searchFiles = allUsersFiles.filter(file => file.name.includes(searchString))

      return response.status(200).json(searchFiles)
    } catch (error) {
      console.log(error)
      return response.status(500).json({message: 'An error occurred in file search'})
    }
  }

  async uploadAvatar(request, response) {
    try {
      const file = request.files.file
      const user = await User.findById(request.user.id)

      const avatarName = Date.now() + file.name
      const avatarPath = `${config.get('staticDir')}/${avatarName}`

      file.mv(avatarPath)

      user.avatar = avatarName
      await user.save()

      return response.status(200).json({avatarName: avatarName})
    } catch (error) {
      console.log(error)
      return response.status(500).json({message: 'An error occurred during uploading avatar'})
    }
  }

  async deleteAvatar(request, response) {
    try {
      const user = await User.findById(request.user.id)

      fs.unlinkSync(`${config.get('staticDir')}/${user.avatar}`)
      user.avatar = null
      await user.save()

      return response.status(200).json(user)
    } catch (error) {
      console.log(error)
      return response.status(500).json({message: 'Error during delete file'})
    }

  }
}

module.exports = new FileController()
