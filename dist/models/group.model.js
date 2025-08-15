"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Group extends sequelize_1.Model {
}
Group.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    avatarUrl: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
    },
    createdBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Group',
    tableName: 'groups',
    timestamps: true,
    indexes: [
        {
            fields: ['createdBy'],
        },
        {
            fields: ['isActive'],
        },
    ],
});
// Associations will be set up in associations.ts
exports.default = Group;
