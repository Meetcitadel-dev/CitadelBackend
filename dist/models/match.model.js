"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Match extends sequelize_1.Model {
}
Match.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
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
    mutualAdjective: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    isConnected: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    matchTimestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    connectionTimestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    iceBreakingPrompt: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Match',
    tableName: 'matches',
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
            fields: ['isConnected'],
        },
        {
            fields: ['mutualAdjective'],
        },
    ],
});
exports.default = Match;
