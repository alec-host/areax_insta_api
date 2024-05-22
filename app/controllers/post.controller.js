const fs = require('fs');
const path = require('path');
const { IgApiClient } = require('instagram-private-api');
const sizeOf = require('image-size');

const postPing = async (req, res) => {
    res.json({ success: true, error: false, message: 'Server is up' });
};

const postCaptionWithImage = async (req, res) => {
    const { username, password, caption } = req.body;

    const ig = new IgApiClient();

    if (!username || !password || !caption || !req.file) {
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields' });
    }

    ig.state.generateDevice(username);

    try {
        //-.login to IG.
        await ig.account.login(username, password);

        const imagePath = req.file.path;        
        const imageBuffer = fs.readFileSync(imagePath);

        //-.check image dimensions.
        const dimensions = sizeOf(imagePath);
        const aspectRatio = dimensions.width / dimensions.height;

        if (aspectRatio !== 0.8 && aspectRatio !== 1.91) {
            res.status(400).json({ success: false, error: true, message: 'Invalid image dimensions. The aspect ratio must be 4:5 or 1:91.' });
            return;
        }

        const ext = path.extname(req.file.originalname);
        if (ext !== '.jpg') {
            res.status(400).json({ success: false, error: true, message: 'Invalid image format. Only .jpg images are accepted.'});
            return;
        }

        //.post the image with the caption.
        const publishResult = await ig.publish.photo({
            file: imageBuffer,
            caption: caption,
        });
        
        //-.clean up.
        fs.unlinkSync(imagePath);
        res.json({ success: true, error: false, message: 'Caption with image posted successfully', data: publishResult });
    }catch(error){
        res.status(500).json({ success: false, error: true, message: error.message });
    }
};

module.exports = {
    postPing,
    postCaptionWithImage
};