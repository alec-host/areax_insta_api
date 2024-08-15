const { db } = require("../../../models");

const InstagramSession = db.instagrams.session;

module.exports.insertOrUpdateInstagramSession = async(payload) => {
    try{
        await InstagramSession.upsert({ payload });    
        console.log('Instagram session inserted or updated successfully.');
    }catch(err){
        console.error('Error: failed to insert or update. ',err);
    }
};