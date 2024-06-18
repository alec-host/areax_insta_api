const redis = require('redis');

const connectToRedis = async () => {
    const client = redis.createClient({
        url: 'redis://localhost:6379'
    });

    client.on('error', (err) => { 
        console.error('Redis Client Error', err);
        return null;
    });

    try{
        await client.connect();
        console.log('Connected to Redis');
        return client;
    }catch(err){
        console.error('Error connecting to Redis', err);
        return null;
    }
};

const closeRedisConnection = async (client) => {
    await client.quit();
    console.log('Disconnected from Redis');
};

module.exports = { connectToRedis, closeRedisConnection };