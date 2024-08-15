const { isInteger } = require("../utils/is.integer");
const { updateMintFlags } = require("./instagram/user/update.mint.flag");

module.exports.updateMintForMultipleFlag = async(req, res) => {
    const { media_item_id,is_already_mint_for_multiple } = req.body;

    if (!media_item_id || !is_already_mint_for_multiple){
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields.' });
    }

    if(!isInteger(is_already_mint_for_multiple)){
        return res.status(400).json({ success: false, error: true, message: 'The value must be an Integer.' });
    }

    const response = await updateMintFlags(media_item_id,{ is_already_mint_for_multiple });
    if(response){
        return res.status(200).json({ success: true, error: false, message: '[is_already_mint_for_multiple] flag was updated successful.' });
    }
};