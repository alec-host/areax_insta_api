const { db } = require("../../../models");

const InstagramSession = db.instagrams.session;

module.exports.getInstagramSessionByUsername = (username) => {
    return new Promise((resolve, reject) => {
        InstagramSession.findOne({
            attributes: ['session'],
            where:{username:username},
            order:[['created_at','DESC']]}).then((data) => {
            if(data){
                resolve(data?.session);
            }else{
                resolve(0);
            }
        }).catch(e => { 
            console.error(e);
            resolve([]);
        });
    });
};