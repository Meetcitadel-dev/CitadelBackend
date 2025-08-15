"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class GroupMessageRead extends sequelize_1.Model {
}
GroupMessageRead.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    messageId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'group_messages',
            key: 'id',
        },
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    readAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.default,
    modelName: 'GroupMessageRead',
    tableName: 'group_message_reads',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['messageId', 'userId'],
        },
        {
            fields: ['messageId'],
        },
        {
            fields: ['userId'],
        },
    ],
});
// Associations will be set up in associations.ts
exports.default = GroupMessageRead;
