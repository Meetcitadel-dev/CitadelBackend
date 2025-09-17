"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class UserUnreadCount extends sequelize_1.Model {
}
UserUnreadCount.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    chatId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        comment: 'Group ID for group chats, User ID for direct chats',
    },
    isGroup: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'true for group chats, false for direct chats',
    },
    unreadCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    lastMessageId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of the last unread message',
    },
}, {
    sequelize: db_1.default,
    modelName: 'UserUnreadCount',
    tableName: 'user_unread_counts',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'chatId', 'isGroup'],
        },
        {
            fields: ['userId'],
        },
        {
            fields: ['chatId'],
        },
        {
            fields: ['userId', 'chatId', 'isGroup'],
        },
    ],
});
exports.default = UserUnreadCount;
