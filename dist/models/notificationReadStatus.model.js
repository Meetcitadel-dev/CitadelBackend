"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class NotificationReadStatus extends sequelize_1.Model {
}
NotificationReadStatus.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id',
        },
    },
    notificationId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'notification_id',
    },
    notificationType: {
        type: sequelize_1.DataTypes.ENUM('connection_request', 'adjective_notification'),
        allowNull: false,
        field: 'notification_type',
    },
    isRead: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read',
    },
    readAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: 'read_at',
    },
}, {
    sequelize: db_1.default,
    modelName: 'NotificationReadStatus',
    tableName: 'notification_read_status',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'notification_id', 'notification_type'],
            name: 'unique_notification_read'
        },
        {
            fields: ['user_id'],
        },
        {
            fields: ['notification_type'],
        },
        {
            fields: ['is_read'],
        },
    ],
});
exports.default = NotificationReadStatus;
