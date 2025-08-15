"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Connection extends sequelize_1.Model {
}
Connection.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId1: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    userId2: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('requested', 'connected', 'blocked'),
        allowNull: false,
        defaultValue: 'requested',
    },
}, {
    sequelize: db_1.default,
    modelName: 'Connection',
    tableName: 'connections',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId1', 'userId2'],
        },
        {
            fields: ['userId1'],
        },
        {
            fields: ['userId2'],
        },
        {
            fields: ['status'],
        },
    ],
});
// Associations will be set up in associations.ts
exports.default = Connection;
