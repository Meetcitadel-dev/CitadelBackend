"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class AdjectiveSession extends sequelize_1.Model {
}
AdjectiveSession.init({
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
    sessionId: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    adjectives: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.default,
    modelName: 'AdjectiveSession',
    tableName: 'adjective_sessions',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'targetUserId', 'sessionId'],
        },
        {
            fields: ['userId'],
        },
        {
            fields: ['targetUserId'],
        },
        {
            fields: ['sessionId'],
        },
        {
            fields: ['expiresAt'],
        },
    ],
});
exports.default = AdjectiveSession;
