"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Message extends sequelize_1.Model {
}
Message.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    conversationId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'conversations',
            key: 'id',
        },
    },
    senderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    text: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('sent', 'delivered', 'read'),
        allowNull: false,
        defaultValue: 'sent',
    },
}, {
    sequelize: db_1.default,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
    indexes: [
        {
            fields: ['conversationId', 'createdAt'],
        },
        {
            fields: ['senderId'],
        },
        {
            fields: ['status'],
        },
    ],
});
exports.default = Message;
