const { connectToRedis, closeRedisConnection } = require('../cache/redis');
const axios = require('axios');

//-function to get media objects by hashtag.
const getMediaByHashtagsWithGraphAPI = async(req, res) => {
  const reference_number =  req.body.reference_number;
  const input_hash_tag = req.body.hash_tag;

  const client = await connectToRedis();
  let accessToken;
  if(client){
    accessToken = await client.get(reference_number);
    await closeRedisConnection(client);
  }

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/ig_hashtag_search`,
      {
        params: {
          user_id: "ig_user_id",
          q: input_hash_tag,
          access_token: accessToken
        }
      }
    );
    //-.returns an array of media IDs associated with the hashtag.
    res.status(200).json({ success: true, error: false, data: response.data.data ,message:'List of retrieved media and assosicated hashtags' });
  }catch(error){
    console.error('Error fetching media by hashtag:', error);
    res.status(500).json({ success: false, error: true,message: error });
  }
};

//-.function to get mentions for the business account.
const getMentionsWithGraphAPI = async(req, res) => {
  const reference_number =  req.body.reference_number;

  const client = await connectToRedis();
  let accessToken;
  if(client){
    accessToken = await client.get(reference_number);
    await closeRedisConnection(client);
  }

  try{
    const response = await axios.get(
    `https://graph.facebook.com/v20.0/${reference_number}/mentioned_media`,
    {
      params: {
      fields: 'id,caption,media_type,media_url,permalink',
      access_token: accessToken
      }
    });
    res.status(200).json({ success: false, error: true, data: response.data.data, message: 'List of retrieved mentions' });
  }catch(error){
    console.error('Error fetching mentions:', error);
    res.status(500).json({ success: false, error: true,message: error });
  }
};

module.exports = {
    getMediaByHashtagsWithGraphAPI,
    getMentionsWithGraphAPI
};