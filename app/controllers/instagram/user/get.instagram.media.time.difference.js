const { db } = require("../../../models");

const Instagrams = db.instagrams;

module.exports.getTimeDifferenceInHours = (username) => {
    return new Promise((resolve, reject) => {
        Instagrams.findOne({
            attributes: ['created_at'],
            where:{username:username},
            order:[['created_at','DESC']]}).then((data) => {
            const now = new Date();
            const createdAt = new Date(data?.created_at);
            if(createdAt){
                const diffInMs = now - createdAt;
                const diffInHours = diffInMs / (1000 * 60 * 60);
                resolve(diffInHours);
            }else{
                resolve(0);
            }
        }).catch(e => { 
            console.error(e);
            resolve([]);
        });
    });
};