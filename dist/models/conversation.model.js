"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Conversation extends sequelize_1.Model {
}
Conversation.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    user1Id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    user2Id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    sequelize: db_1.default,
    modelName: 'Conversation',
    tableName: 'conversations',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user1Id', 'user2Id'],
        },
        {
            fields: ['user1Id'],
        },
        {
            fields: ['user2Id'],
        },
    ],
});
exports.default = Conversation;
