"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class AdjectiveSelection extends sequelize_1.Model {
}
AdjectiveSelection.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    targetUserId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    adjective: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    isMatched: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'AdjectiveSelection',
    tableName: 'adjective_selections',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'targetUserId'],
        },
        {
            fields: ['userId'],
        },
        {
            fields: ['targetUserId'],
        },
        {
            fields: ['adjective'],
        },
        {
            fields: ['isMatched'],
        },
    ],
});
exports.default = AdjectiveSelection;
