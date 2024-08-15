const { db } = require("../../../models");
const { convertImageUrlToBase64 } = require("../../../utils/convert.image.base64");

const Instagrams = db.instagrams;

module.exports.getInstagramMediaByUsername = (username) => {
    const _limit = 1000;
    return new Promise((resolve, reject) => {
        Instagrams.findAll({
            attributes: ['media_item_id','caption','image_url','like_count','comment_count','engagement','is_minted','is_already_mint_for_multiple'], 
            where:{username:username},
            limit:_limit,
            order:[['created_at','DESC']]}).then((data) => {
            //const jsonData = data.map(item => item.toJSON());
            const jsonData = data.map(async record => ({
                media_item_id: record.media_item_id,
                caption: record.caption,
                image_url: await convertImageUrlToBase64(record.image_url),
                like_count: record.like_count,
                comment_count: record.comment_count,
                engagement: record.engagement,
                share_link: record.share_link,
                is_minted: record.is_minted
            }));
            resolve(jsonData)
        }).catch(e => { 
            console.error(e);
            resolve([]);
        });
    });
};