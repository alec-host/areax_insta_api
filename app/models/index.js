const { Sequelize } = require("sequelize");
const sequelize = require("../db/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.instagrams = require("./instagram.media.item.model")(sequelize,Sequelize);
db.instagrams.session = require("./instagram.session.model")(sequelize,Sequelize);

module.exports = { db };