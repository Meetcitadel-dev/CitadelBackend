"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class ConnectionRequest extends sequelize_1.Model {
}
ConnectionRequest.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    requesterId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'requester_id',
        references: {
            model: 'users',
            key: 'id',
        },
    },
    targetId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'target_id',
        references: {
            model: 'users',
            key: 'id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
    },
}, {
    sequelize: db_1.default,
    modelName: 'ConnectionRequest',
    tableName: 'connection_requests',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['requester_id', 'target_id'],
            name: 'unique_connection_request'
        },
        {
            fields: ['requester_id'],
        },
        {
            fields: ['target_id'],
        },
        {
            fields: ['status'],
        },
    ],
});
exports.default = ConnectionRequest;
