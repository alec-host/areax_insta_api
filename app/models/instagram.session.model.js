const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const InstagramSession = sequelize.define('InstagramSession', {
    _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(60),
        unique: true,
        allowNull: false,
        collate: 'utf8mb4_general_ci',
    },  
    session: {
        type: DataTypes.TEXT,
        allowNull: false,
        collate: 'utf8mb4_general_ci',
    },           
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {   
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    is_revoked: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }    
    }, {
    indexes: [
        {
            name: 'username_index',
            fields: ['username'],
            using: 'BTREE',
        },
        {
            name: 'is_revoked_index',
            fields: ['is_revoked'],
            using: 'BTREE',
        }
    ],
    timestamps: false,
    tableName: 'tbl_instagram_session',
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
    });

    return InstagramSession;
};