import express from 'express'

import initWebRoutes from './routes/web'
import bodyParser from 'body-parser'
require('dotenv').config()

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

initWebRoutes(app)

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log('Chat bot đang chạy ở cổng:' + port)
})
