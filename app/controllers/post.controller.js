const fs = require('fs');
const { IgApiClient } = require('instagram-private-api');

const postCaptionWithImage = async (req, res) => {
    const { username, password, caption } = req.body;

    const ig = new IgApiClient();

    if (!username || !password || !caption || !req.file) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    ig.state.generateDevice(username);

    try {
        //-.login to IG.
        await ig.account.login(username, password);

        const imageBuffer = fs.readFileSync(req.file.path);

        //-.post the image with the caption.
        const publishResult = await ig.publish.photo({
            file: imageBuffer,
            caption: caption,
        });
        //-.clean up.
        fs.unlinkSync(req.file.path);
        res.json({ success: true, message: 'Caption with image posted successfully', data: publishResult });
    }catch(error){
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    postCaptionWithImage
};
