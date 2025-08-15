"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    isEmailVerified: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    otpAttempts: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        unique: true,
    },
    universityId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    degree: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    year: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    gender: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    dateOfBirth: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    skills: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    friends: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    aboutMe: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        field: 'about_me',
    },
    sports: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: 'sports',
    },
    movies: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: 'movies',
    },
    tvShows: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: 'tv_shows',
    },
    teams: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: 'teams',
    },
    portfolioLink: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        field: 'portfolio_link',
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
        field: 'phone_number',
    },
    isProfileComplete: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
});
// Associations will be set up in associations.ts
exports.default = User;
