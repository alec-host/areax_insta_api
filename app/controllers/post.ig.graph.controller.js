const axios = require('axios');
const FormData = require('form-data');
const { connectToRedis, closeRedisConnection } = require('../cache/redis');

module.exports.postImageWithCaptionGraphAPI = async(req, res) => {
    
    const {reference_number,caption} = req.body;

    const imagePath = req.file.path;

    const client = await connectToRedis();
    let accessToken;
    if(client){
        accessToken = await client.get(reference_number);
        await closeRedisConnection(client);
    }

    if(!accessToken) {
        return res.status(400).send({success: false, error: true,message: 'Access token not available. Please authenticate first.'});
    }

    try{
        //-.verify image dimensions.
        const dimensions = sizeOf(imagePath);
        const aspectRatio = dimensions.width / dimensions.height;

        if (aspectRatio !== 0.8 && aspectRatio !== 1.91) {
            res.status(400).json({ success: false, error: true, message: 'Invalid image dimensions. The aspect ratio must be 4:5 or 1:91.' });
            return;
        }

        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));
        formData.append('caption', caption);
        formData.append('access_token', accessToken);
    
        const mediaContainerResponse = await axios({
            method: 'post',
            url: `https://graph.facebook.com/v20.0/7499755010072480/media`,
            data: formData,
            headers: formData.getHeaders() 
        });
    
        const mediaContainerId = mediaContainerResponse.data.id;
    
        // Publish the media
        const publishResponse = await axios.post(`https://graph.facebook.com/v20.0/7499755010072480/media_publish`, {
            creation_id: mediaContainerId,
            access_token: accessToken
        });
    
        console.log('Post created successfully:', publishResponse.data);
        res.send({ success: true, error: false, message:'Post created successfully' });
    }catch(error){
        console.error('Error posting to Instagram:',  error.response ? error.response.data : error.message);
        res.status(500).send({ success: false, error: true, message:'Error posting to Instagram' });
    }finally{
        // Clean up uploaded file
        fs.unlink(imagePath, (err) => {
            if(err)console.error('Error deleting file:', err);
        });
    }
};