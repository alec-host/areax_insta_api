const { db } = require("../../../models");

const InstagramMediaItem = db.instagrams;

module.exports.updateMintFlags = async(media_item_id,payload) => {
    const isUpdated = await InstagramMediaItem.update(payload,{ where:{media_item_id:media_item_id}}).catch(e => { return false; });
    if(!isUpdated){
        return false;
    }
    return true;
};