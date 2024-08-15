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

const deleteData = async(client,key) => {
    client.del(key, (err, response) => {
        if(err){
            console.error('Error purging key ', err);
        }else if(response === 1){
            console.log(`Key ${key} deleted successfully`);
        }else{
            console.log(`Key ${key} deleted does not exist`);
        }
    });
};

const saveData = async(client,key,value) => {
    client.set(key,value, (err, response) => {
        if(err){
            console.err('Error saving data', err);
        }else{
            console,log(`Data save for key ${key} : ${response}`);
        }
    });
};

const readData = (client,key) => {
    return new Promise((resolve, reject) => {
        client.get(key, (err, response) => {
            if(err){
                console.error('Error reading key ', err);
                reject(err);
            }else if(response){
                console.log(`Data for key ${key} : `,response);
                resolve(response);
            }else{
                console.log(`Key ${key}: does not exist`);
                resolve(null);
            }
        });
    });
};

const closeRedisConnection = async (client) => {
    await client.quit();
    console.log('Disconnected from Redis');
};

module.exports = { connectToRedis, closeRedisConnection, saveData, readData, deleteData };