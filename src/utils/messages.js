const generateMessage = (username, text) => {
    return {
        username,
        text, 
        createdAt: new Date().getTime()
    }
}

const generateLocation = (username, lat, lng) => {
    return {
        username,
        url: `https://google.com/maps?q=${lat},${lng}`, 
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocation
}