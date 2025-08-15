"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class AdjectiveMatch extends sequelize_1.Model {
}
AdjectiveMatch.init({
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
    adjective: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    matched: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'AdjectiveMatch',
    tableName: 'adjective_matches',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId1', 'userId2', 'adjective'],
        },
        {
            fields: ['userId1'],
        },
        {
            fields: ['userId2'],
        },
        {
            fields: ['adjective'],
        },
        {
            fields: ['matched'],
        },
    ],
});
// Associations will be set up in associations.ts
exports.default = AdjectiveMatch;
