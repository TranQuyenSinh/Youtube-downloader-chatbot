const ytdl = require('ytdl-core')

export const checkValidUrl = url => {
    return ytdl.validateURL(url)
}

export const getInfo = (link = id) => {
    return ytdl.getInfo(link)
    // console.log('title:', info.videoDetails.title)
    // console.log('rating:', info.player_response.videoDetails.averageRating)
    // console.log('uploaded by:', info.videoDetails.author.name)
}

export const getAudio = async url => {
    let isValidUrl = ytdl.validateURL(url)
    if (!isValidUrl) throw new Error()
    let stream = ytdl(url, {
        quality: 'highestaudio',
    })
    return stream
}
