const fs = require('fs');
const path = require('path');
const { IgApiClient } = require('instagram-private-api');
const sizeOf = require('image-size');
const { connectToRedis, closeRedisConnection, deleteData, saveData } = require('../cache/redis');
const { convertImageUrlToBase64 } = require('../utils/convert.image.base64');
const rateLimiter = require('../utils/rate.limiter');
const { getImageBufferFromURL } = require('../utils/convert.image.url.buffer');
const { getImageExtension } = require('../utils/image.extension');
const { insertOrUpdateInstagramMedia } = require('../controllers/instagram/user/store.instagram.media');
const { getTimeDifferenceInHours } = require('./instagram/user/get.instagram.media.time.difference');
const { INSTAGRAM_WAIT_TIME_IN_HOURS, INSTAGRAM_URL_PROXY } = require('../constants/app_constants');
const { getInstagramMediaByUsername } = require('./instagram/user/get.instagram.media')
const { delay } = require('../utils/random.delay');

const ig = new IgApiClient();

const postPing = async (req, res) => {
    res.json({ success: true, error: false, message: 'Server is up' });
};

const loginAndSaveUserSession = async(ig,username,password,appendKeyString,client) => {
    await ig.simulate.preLoginFlow();
    await ig.account.login(username, password);
    process.nextTick(async () => await ig.simulate.postLoginFlow());
    //-.save session cookie
    const sessionCookie = await ig.state.serialize();
    await saveData(client,`${username}${appendKeyString}`,JSON.stringify(sessionCookie));
};

const checkUserSession = async(ig,username,password,appendKeyString,client) => {
    const sessionExist = await client.get(`${username}${appendKeyString}`);
    try{
        if(sessionExist){
            const sessionData = JSON.parse(sessionExist);
            await ig.state.deserialize(sessionData);

            await ig.account.currentUser();
        }else{
            await loginAndSaveUserSession(ig,username,password,appendKeyString,client);
        }
    }catch(error){
        if(error.name === 'IgLoginRequiredError' || error.message.includes('checkpoint_required')){
            console.log('Session has expired or is invalid, logging in again...');
            await deleteData(client,appendKeyString);
            await loginAndSaveUserSession(ig,username,password,appendKeyString,client);
        }else{
            throw error;
        }
    }
};

const postImageWithCaptionPrivateApi = rateLimiter.wrap(async(req, res) => {
    const { username, password, caption } = req.body;

    if (!username || !password || !caption || !req.file) {
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields' });
    }

    const client = await connectToRedis();

    ig.state.generateDevice(username);
    ig.request.defaults.proxy = INSTAGRAM_URL_PROXY;

    try {

        (async () => {

            const appendKeyString = '_session';
            await checkUserSession(ig,username,password,appendKeyString,client);

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
            if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
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
        })();
    }catch(error){
        res.status(400).json({ success: false, error: true, message: error.message });
    }
    await closeRedisConnection(client);
});

const postImageUrlWithCaptionPrivateApi = rateLimiter.wrap(async(req, res) => {
    const { username, password, imageUrl, caption } = req.body;

    if (!username || !password || !imageUrl || !caption) {
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields' });
    }

    const client = await connectToRedis();

    ig.state.generateDevice(username);
    ig.request.defaults.proxy = INSTAGRAM_URL_PROXY;

    try {

        (async () => {

            const appendKeyString = '_session';
            await checkUserSession(ig,username,password,appendKeyString,client);

            const imageBuffer = await getImageBufferFromURL(imageUrl);
            if(imageBuffer[0]){

                //-.check image dimensions.
                const dimensions = sizeOf(imageBuffer[1]);
                const aspectRatio = dimensions.width / dimensions.height;

                if (aspectRatio !== 0.8 && aspectRatio !== 1.91) {
                    res.status(400).json({ success: false, error: true, message: 'Invalid image dimensions. The aspect ratio must be 4:5 or 1:91.' });
                    return;
                }

                const ext = await getImageExtension(imageUrl);
                if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png') {
                    res.status(400).json({ success: false, error: true, message: 'Invalid image format. Only jpg, png images are accepted.'});
                    return;
                }

                //.post the image with the caption.
                const publishResult = await ig.publish.photo({
                    file: imageBuffer[1],
                    caption: caption,
                });

                res.json({ success: true, error: false, message: 'Image with caption has been posted.', data: publishResult });
            }else{
                res.status(400).json({ success: false, error: true, message: `Error: ${imageBuffer[1].message}`});
            }
        })();
    }catch(error){
        res.status(400).json({ success: false, error: true, message: error.message });
    }
    await closeRedisConnection(client);
});

const getUserProfileInfoAndInsightsWithPrivateApi = rateLimiter.wrap(async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields' });
    }

    const client = await connectToRedis();
    try {
        const timeDiffInHours = await getTimeDifferenceInHours(username);
        console.log('TIME DIF TIME DIF ', timeDiffInHours);
        if(timeDiffInHours <= INSTAGRAM_WAIT_TIME_IN_HOURS){
            const cacheData = await client.get(username);
            const { user_meta_data,profilePicUrl,followersCount } = JSON.parse(cacheData);
            const storedMediaItem = await getInstagramMediaByUsername(username);
            const insights = await Promise.all(storedMediaItem.map(async record => ({
                media_item_id: record.media_item_id,
                caption: record.caption,
                image_url: await convertImageUrlToBase64(record.image_url),
                like_count: record.like_count,
                comment_count: record.comment_count,
                engagement: record.engagement,
                share_link: record.share_link,
                is_minted: record.is_minted,
                is_already_mint_for_multiple: record.is_already_mint_for_multiple
            })));

            const response = {
                success: true,
                error: false,
                data: {
                    user_meta_data,
                    profilePicUrl,
                    followersCount,
                    insights
                },
                message: "user info and insights via instagram-private-api"
            };

            res.status(200).json(response);
        }else{

            const randomDelay = Math.floor(Math.random() * 10000) + 5000;

            ig.state.generateDevice(username);
            ig.request.defaults.proxy = INSTAGRAM_URL_PROXY;

            const appendKeyString = '_session';
            await checkUserSession(ig,username,password,appendKeyString,client);

            //-.get user information.
            const userInfo = await ig.user.searchExact(username);
            const userMetadata = await ig.user.info(userInfo.pk);

            const {full_name,biography,external_url,category,is_private,is_business,city_name} = userMetadata;

            //-.get the user's follower count and profile picture URL
            const noOfFollowers = userInfo.follower_count;
            const profilePicUrl = await convertImageUrlToBase64(userInfo.profile_pic_url);

            let mediaCount;
            const userFeed = await ig.feed.user(userInfo.pk);
            try{
                //-.retrieve all items from the user's media feed.
                const allMedia = userFeed.items();
                mediaCount = allMedia.length;
            }catch(err){
                console.error('Error fetching insights:', err);
                mediaCount = 0;
            }

            await delay(randomDelay);

            //-.get insights.
            //-.for this, the account needs to be a business account and you need to have the required permissions.
            const insights = [];
            try{
                    const posts = await userFeed.items();
                    const now = new Date();
                    for(const post of posts) {
                        const mediaInfo = await ig.media.info(post.pk);
                        const mediaItem = mediaInfo.items[0];
                        const mediaPayload = {
                            media_item_id: mediaItem?.id,
                            username: username,
                            caption: mediaItem.caption ? mediaItem.caption.text : '',
                            image_url: mediaItem.image_versions2.candidates[0].url,
                            like_count: mediaItem.like_count ? mediaItem?.like_count : 0,
                            comment_count: mediaItem.comment_count ? mediaItem?.comment_count : 0,
                            engagement: mediaItem.engagement ? mediaItem?.engagement : null,
                            share_link:`https://www.instagram.com/p/${post.code}/`,
                            created_at: now
                        };

                        await insertOrUpdateInstagramMedia(mediaPayload);
                        console.log('INSERT INSERT ');
                        const storedMediaItem = await getInstagramMediaByUsername(username);
                        const storedMediaPayload = {
                            media_item_id: storedMediaItem[0].media_item_id,
                            caption: storedMediaItem[0].caption,
                            image_url: await convertImageUrlToBase64(storedMediaItem[0].image_url),
                            like_count: storedMediaItem[0].like_count,
                            comment_count: storedMediaItem[0].comment_count,
                            engagement: storedMediaItem[0].engagement,
                            share_link: storedMediaItem[0].share_link,
                            is_minted: storedMediaItem[0].is_minted,
                            is_already_mint_for_multiple: storedMediaItem[0].is_already_mint_for_multiple
                        };

                        insights.push(storedMediaPayload);
                    }
            }catch(error){
                console.error('Error fetching insights:', error);
            }

            await delay(randomDelay);

            //-followers count - limited business a/c with 100+ followers.
            const info = await ig.user.info(ig.state.cookieUserId);
            const followersCount = info.follower_count;
            const post_url = null;
            const response = {
                success: true,
                error: false,
                data: {
                    user_meta_data:{ full_name,biography,external_url,category,is_private,is_business,city_name },
                    profilePicUrl,
                    noOfFollowers,
                    mediaCount,
                    followersCount,
                    insights
                },
                message: "user info and insights via instagram-private-api"
            };
            const iGInfo = {
                user_meta_data:{ full_name,biography,external_url,category,is_private,is_business,city_name },
                profilePicUrl,
                noOfFollowers,
                mediaCount,
                followersCount
            };
            await deleteData(client,username);
            await saveData(client,username,JSON.stringify(iGInfo));

            res.status(200).json(response);
        }
    }catch(error){
        res.status(400).json({ success: false, error: true, message: error.message });
    }
    await closeRedisConnection(client);
});

const trackHashtagWithPrivateApi = rateLimiter.wrap(async(req, res) => {
    const { username, password, hashtag } = req.body;

    if (!username || !password || !hashtag) {
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields' });
    }

    const client = await connectToRedis();

    ig.state.generateDevice(username);
    ig.request.defaults.proxy = INSTAGRAM_URL_PROXY;

    try{

        (async () => {

            const appendKeyString = '_session';
            await checkUserSession(ig,username,password,appendKeyString,client);

            const searchResults = await rateLimiter.wrap(() => ig.search.tags(hashtag));
            if(!searchResults || !searchResults.results || searchResults.results.length === 0){
                res.status(404).json({ success: false, error: true, data: [], message: "Hashtag not found."});
                return;
            }

            const hashtagId = searchResults.results[0].id;

            const hashtagFeed = await ig.feed.tag(hashtagId);

            const posts = await limiter.wrap(() => hashtagFeed.items());
            const hashtagPosts = posts.map(post => ({
                id: post.id,
                username: post.user.username,
                caption: post.caption ? post.caption.text : '',
                imageUrl: post.image_versions2.candidates[0].url,
                likeCount: post.like_count,
                commentCount: post.comment_count,
            }));
            res.status(200).json({ success: true, error: false, data: hashtagPosts, message: "List of hashtag posts."});
        })();
    }catch(error){
        console.error('ERROR: ',error.message);
        res.status(400).json({ success: false, error: true, message: error.message });
    }
    await closeRedisConnection(client);
});

module.exports = {
    postPing,
    postImageWithCaptionPrivateApi,
    postImageUrlWithCaptionPrivateApi,
    getUserProfileInfoAndInsightsWithPrivateApi,
    trackHashtagWithPrivateApi
};