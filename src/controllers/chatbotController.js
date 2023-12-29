import request from 'request'
import * as ytService from '../services/ytService.js'
require('dotenv').config()

const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const getHomePage = (req, res) => {
    return res.send('Xin chào')
}
const getWebHook = (req, res) => {
    let mode = req.query['hub.mode']
    let token = req.query['hub.verify_token']
    let challenge = req.query['hub.challenge']

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED')
            res.status(200).send(challenge)
        } else {
            res.sendStatus(403)
        }
    }
}

const postWebHook = (req, res) => {
    let body = req.body
    let host = 'https://' + req.host

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            let webhook_event = entry.messaging[0]
            let sender_psid = webhook_event.sender.id
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message, host)
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback)
            }
        })
        res.status(200).send('EVENT_RECEIVED')
    } else {
        res.sendStatus(404)
    }
}

const handleMessage = (sender_psid, received_message, host) => {
    let res
    let responseText = ''
    let url = received_message.text
    if (url) {
        let isValidUrl = ytService.checkValidUrl(url)
        if (!isValidUrl) {
            responseText = 'Đường dẫn Youtube không tồn tại'
        } else {
            responseText = `${host}/download?url=${received_message.text}`
        }
        res = {
            text: responseText,
        }
    }
    console.log('Res: ', responseText)
    callSendAPI(sender_psid, res)
}

const test = (req, res) => {
    let { url } = req.query
    let rec = { text: url }
    let host = req.protocol + '://' + req.hostname + ':' + req.headers.host.split(':')[1] || ''
    handleMessage(1, rec, host)
}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        recipient: {
            id: sender_psid,
        },
        message: response,
    }

    // Send the HTTP request to the Messenger Platform
    request(
        {
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: request_body,
        },
        (err, res, body) => {
            if (!err) {
                console.log('message sent!')
            } else {
                console.error('Unable to send message:' + err)
            }
        }
    )
}

async function download(req, res) {
    let { url } = req.query

    let isValidUrl = ytService.checkValidUrl(url)
    if (!isValidUrl) {
        return res.status(404).send('Đường dẫn Youtube không tồn tại')
    }

    try {
        let info = await ytService.getInfo(url)

        let stream = await ytService.getAudio(url)
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Disposition', `attachment; filename=${info.videoDetails.title}.mp3`)

        stream.pipe(res)
    } catch (e) {
        return res.status(404).send('Có lỗi xảy ra, vui lòng thử lại')
    }
}

export default { getHomePage, getWebHook, postWebHook, download, test }
