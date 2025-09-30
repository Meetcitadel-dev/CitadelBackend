"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const user_model_1 = __importDefault(require("./user.model"));
const userImage_model_1 = __importDefault(require("./userImage.model"));
class UserImageSlot extends sequelize_1.Model {
}
UserImageSlot.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
    },
    slot: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    userImageId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'user_images', key: 'id' },
    },
    assignedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: db_1.default,
    modelName: 'UserImageSlot',
    tableName: 'user_image_slots',
    timestamps: true,
});
UserImageSlot.belongsTo(user_model_1.default, { foreignKey: 'userId', as: 'user' });
UserImageSlot.belongsTo(userImage_model_1.default, { foreignKey: 'userImageId', as: 'image' });
exports.default = UserImageSlot;
