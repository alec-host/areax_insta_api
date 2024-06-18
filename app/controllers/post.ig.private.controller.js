const fs = require('fs');
const path = require('path');
const { IgApiClient } = require('instagram-private-api');
const sizeOf = require('image-size');
const { connectToRedis, closeRedisConnection } = require('../cache/redis');
const { convertImageUrlToBase64 } = require('../utils/convert.image.base64');
const rateLimiter = require('../utils/rate.limiter');

const postPing = async (req, res) => {
    res.json({ success: true, error: false, message: 'Server is up' });
};

const postImageWithCaptionPrivateApi = rateLimiter.wrap(async(req, res) => {
    const { username, password, caption } = req.body;

    const ig = new IgApiClient();

    if (!username || !password || !caption || !req.file) {
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields' });
    }

    ig.state.generateDevice(username);

    try {
        //-.login to IG.
        await ig.account.login(username, password);


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
        if (ext !== '.jpg') {
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
    }catch(error){
        res.status(400).json({ success: false, error: true, message: error.message });
    }
});

const getUserProfileInfoAndInsightsWithPrivateApi = rateLimiter.wrap(async(req, res) => {
    const { username, password } = req.body;

    const ig = new IgApiClient();

    if (!username || !password) {
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields' });
    }

    ig.state.generateDevice(username);

    try {

        await ig.account.login(username, password);

        //-.get user information.
        const userInfo = await ig.user.searchExact(username);
        const userMetadata = await ig.user.info(userInfo.pk);

        const {full_name,biography,external_url,category,is_private,is_business,city_name} = userMetadata;

        //-get the user's follower count and profile picture URL
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

        //-.get insights.
        //-.for this, the account needs to be a business account and you need to have the required permissions.
        const insights = [];
        try{
            const posts = await userFeed.items();
            for (const post of posts) {
                const mediaInfo = await ig.media.info(post.pk);
                const mediaItem = mediaInfo.items[0];
                insights.push({
                    id: mediaItem.id,
                    caption: mediaItem.caption ? mediaItem.caption.text : '',
                    imageUrl: await convertImageUrlToBase64(mediaItem.image_versions2.candidates[0].url),
                    likeCount: mediaItem.like_count,
                    commentCount: mediaItem.comment_count,
                    engagement: mediaItem.engagement,
                  });
            }
        }catch(error){
            console.error('Error fetching insights:', error);
        }

        //-followers count - limited business a/c with 100+ followers.
        const info = await ig.user.info(ig.state.cookieUserId);
        const followersCount = info.follower_count;

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

        //-.connect to redis.
        const client = await connectToRedis();
        if(client){
            client.set(username,JSON.stringify(response));
            await closeRedisConnection(client);
        }
        res.status(200).json(response);
    }catch(error){
        res.status(400).json({ success: false, error: true, message: error.message });
    }
});

const trackHashtagWithPrivateApi = rateLimiter.wrap(async(req, res) => {
    const { username, password, hashtag } = req.body;

    const ig = new IgApiClient();

    if (!username || !password || !hashtag) {
        return res.status(400).json({ success: false, error: true, message: 'Missing required fields' });
    }

    ig.state.generateDevice(username);

    try{

        rateLimiter.wrap(async() => {
            await ig.account.login(username, password);
        });

        const searchResults = await rateLimiter.wrap(() => ig.search.tags(hashtag));
        if(!searchResults || !searchResults.results || searchResults.results.length === 0){
            res.status(404).json({ success: false, error: true, data: [], message: "Hashtag not found."});
            return;
        }

        const hashtagId = searchResults.results[0].id;

        const hashtagFeed = ig.feed.tag(hashtagId);

        const posts = await limiter.wrap(() => hashtagFeed.items());
        const hashtagPosts = posts.map(post => ({
            id: post.id,
            username: post.user.username,
            caption: post.caption ? post.caption.text : '',
            imageUrl: post.image_versions2.candidates[0].url,
            likeCount: post.like_count,
            commentCount: post.comment_count,
        }));
        console.log(hashtagPosts);
        res.status(200).json({ success: true, error: false, data: hashtagPosts, message: "List of hashtag posts."});
    }catch(error){
        console.error('ERROR: ',error.message);
        res.status(400).json({ success: false, error: true, message: error.message });
    }
});

module.exports = {
    postPing,
    postImageWithCaptionPrivateApi,
    getUserProfileInfoAndInsightsWithPrivateApi,
    trackHashtagWithPrivateApi
};