"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class GroupMessage extends sequelize_1.Model {
}
GroupMessage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    groupId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'groups',
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
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    messageType: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'text',
    },
    isEdited: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    editedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'GroupMessage',
    tableName: 'group_messages',
    timestamps: true,
    indexes: [
        {
            fields: ['groupId'],
        },
        {
            fields: ['senderId'],
        },
        {
            fields: ['createdAt'],
        },
    ],
});
// Associations will be set up in associations.ts
exports.default = GroupMessage;
