const axios = require('axios');

module.exports.getImageBufferFromURL = async(imageURL) => {
    try {
        // Fetch the image data from the URL
        const response = await axios({
            url: imageURL,
            responseType: 'arraybuffer'
        });

        // Convert the image data to a buffer
        const imageBuffer = Buffer.from(response.data, 'binary');

        return [true,imageBuffer];
    } catch (error) {
        console.error('Error fetching or processing the image:', error);
        return [false,error];
    }
};