const { db } = require("../../../models");

const InstagramMediaItem = db.instagrams;

module.exports.insertOrUpdateInstagramMedia = async(payload) => {
    try{
        await InstagramMediaItem.upsert({ payload });    
        console.log('Instagram media inserted or updated successfully.');
    }catch(err){
        console.error('Error: failed to insert or update. ',err);
    }
};