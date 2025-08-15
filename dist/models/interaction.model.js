"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Interaction extends sequelize_1.Model {
}
Interaction.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
    },
    targetUserId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: 'target_user_id',
    },
    interactionType: {
        type: sequelize_1.DataTypes.ENUM('viewed', 'connected', 'adjective_selected', 'blocked'),
        allowNull: false,
        field: 'interaction_type',
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.default,
    tableName: 'interactions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'target_user_id', 'interaction_type'],
            name: 'unique_user_interaction'
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['target_user_id']
        },
        {
            fields: ['timestamp']
        }
    ]
});
exports.default = Interaction;
