const axios = require('axios').default;
const fs = require('fs');

module.exports.convertImageUrlToBase64 = async(url) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const base64 = buffer.toString('base64');
    return base64;
};