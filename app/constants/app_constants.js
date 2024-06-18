require('dotenv').config();

process.env.APP_SERVER_PORT;

module.exports = {
    APP_SERVER_PORT: process.env.PORT || 9000, 
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: process.env.DATABASE_PORT,
    DATABASE_PASS: process.env.DATABASE_PASS,
    DATABASE_NAME_TWO: process.env.DATABASE_NAME_TWO,
    DATABASE_USER_TWO: process.env.DATABASE_USER_TWO,
    DATABASE_HOST_TWO: process.env.DATABASE_HOST_TWO,
    DATABASE_PORT_TWO: process.env.DATABASE_PORT_TWO,
    DATABASE_PASS_TWO: process.env.DATABASE_PASS_TWO,
};