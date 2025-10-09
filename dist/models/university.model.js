"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class University extends sequelize_1.Model {
}
University.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    domain: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'University',
    tableName: 'universities',
    timestamps: true,
    indexes: [
        {
            name: 'universities_name_idx',
            fields: ['name']
        },
        {
            name: 'universities_name_gin_idx',
            fields: ['name'],
            using: 'gin',
            operator: 'gin_trgm_ops'
        },
        {
            name: 'universities_domain_idx',
            fields: ['domain']
        },
        {
            name: 'universities_country_idx',
            fields: ['country']
        }
    ]
});
exports.default = University;
