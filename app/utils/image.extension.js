const axios = require('axios');

module.exports.getImageExtension = async(imageUrl) => {
  try {
    const response = await axios.head(imageUrl);
    const contentType = response.headers['content-type'];
    const extension = contentType.split('/')[1];
    return extension;
  } catch (error) {
    console.error('Error fetching image:', error.message);
    return null;
  }
};