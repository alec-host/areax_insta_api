const { updateMintFlags } = require("./instagram/user/update.mint.flag");

module.exports.updateIsMintedFlag = async(req, res) => {
    const { media_item_id,is_minted } = req.body;

    if (!media_item_id || !is_minted) {
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields' });
    }

    const response = await updateMintFlags(media_item_id,{ is_minted });
    if(response){
        return res.status(200).json({ success: true, error: false, message: 'Update was successful' });
    }
};