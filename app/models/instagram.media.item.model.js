const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const InstagramMediaItem = sequelize.define('InstagramMediaItem', {
    _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    media_item_id: {
        type: DataTypes.STRING(250),
        unique: true,
        allowNull: false,
        collate: 'utf8mb4_general_ci',
    },
    username: {
        type: DataTypes.STRING(60),
        allowNull: false,
        collate: 'utf8mb4_general_ci',
    },  
    caption: {
        type: DataTypes.TEXT,
        allowNull: false,
        collate: 'utf8mb4_general_ci',
    },
    image_url: {
        type: DataTypes.TEXT('medium'),
        allowNull: false,
        collate: 'utf8mb4_general_ci',
    },
    like_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        collate: 'utf8mb4_general_ci',
    },
    comment_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        collate: 'utf8mb4_general_ci',
    },   
    engagement: {
        type: DataTypes.STRING(250),
        allowNull: true,
        collate: 'utf8mb4_general_ci',
    },  
    share_link: {
        type: DataTypes.STRING(250),
        allowNull: true,
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
    is_minted: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }, 
    is_already_mint_for_multiple: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }  
    }, {
    indexes: [
        {
            name: 'media_item_id_index',
            fields: ['media_item_id'],
            using: 'BTREE',
        },
        {
            name: 'is_minted_index',
            fields: ['is_minted'],
            using: 'BTREE',
        },
        {
            name: 'is_already_mint_for_multiple_index',
            fields: ['is_already_mint_for_multiple'],
            using: 'BTREE',
        }        
    ],
    timestamps: false,
    tableName: 'tbl_instagram_media_item',
    collate: 'utf8mb4_general_ci',
    engine: 'InnoDB',
    });

    return InstagramMediaItem;
};