const Sequelize = require("sequelize");
const { DATABASE_NAME_TWO, DATABASE_USER_TWO, DATABASE_PASS_TWO, DATABASE_HOST_TWO } = require("../constants/app_constants");

const sequelize = new Sequelize(
   DATABASE_NAME_TWO,
   DATABASE_USER_TWO,
   DATABASE_PASS_TWO,
    {
      host: DATABASE_HOST_TWO,
      dialect: 'mysql',
      pool: {
         max: 5,
         min: 0,
         acquire: 30000,
         idle: 10000
      }
    }
);

sequelize.authenticate().then(() => {
   console.log('Connection2: was successful.');
}).catch((error) => {
   console.error('Unable to connect to the database 2: ', error);
});

module.exports = sequelize;