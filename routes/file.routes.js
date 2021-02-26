const Router = require('express')
const authMiddleware = require('../middlewares/auth.middleware')
const FileController = require('../controllers/fileController')
const router = new Router



router.post('', authMiddleware, FileController.createDir)
router.get('', authMiddleware, FileController.getFiles)
router.post('/upload', authMiddleware, FileController.uploadFiles)
router.post('/avatar', authMiddleware, FileController.uploadAvatar)
router.get('/download', authMiddleware, FileController.downloadFile)
router.get('/search', authMiddleware, FileController.searchFile)
router.delete('', authMiddleware, FileController.deleteFile)
router.delete('/avatar', authMiddleware, FileController.deleteAvatar)






module.exports = router
