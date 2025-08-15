"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class UserOnlineStatus extends sequelize_1.Model {
}
UserOnlineStatus.init({
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    isOnline: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    lastSeen: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.default,
    modelName: 'UserOnlineStatus',
    tableName: 'user_online_status',
    timestamps: true,
    indexes: [
        {
            fields: ['isOnline', 'lastSeen'],
        },
    ],
});
exports.default = UserOnlineStatus;
