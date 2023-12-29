import express from 'express'
import chatbotController from '../controllers/chatbotController'

const router = express.Router()

const initWebRoutes = app => {
    router.get('/', chatbotController.getHomePage)
    router.get('/webhook', chatbotController.getWebHook)
    router.post('/webhook', chatbotController.postWebHook)

    router.get('/download', chatbotController.download)
    router.get('/test', chatbotController.test)

    return app.use('/', router)
}

export default initWebRoutes
