"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const user_model_1 = __importDefault(require("./user.model"));
class UserImage extends sequelize_1.Model {
}
UserImage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
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
    s3Key: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cloudfrontUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    originalName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    mimeType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    fileSize: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'UserImage',
    tableName: 'user_images',
    timestamps: true,
});
// Define association (only one side to avoid circular dependency)
UserImage.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'user' });
exports.default = UserImage;
