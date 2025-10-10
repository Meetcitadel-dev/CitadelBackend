import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';
import UserImage from './userImage.model';

export interface UserImageSlotAttributes {
  id: number;
  userId: number;
  slot: number;
  userImageId: number;
  assignedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserImageSlotCreationAttributes extends Optional<UserImageSlotAttributes, 'id' | 'assignedAt' | 'createdAt' | 'updatedAt'> {}

class UserImageSlot extends Model<UserImageSlotAttributes, UserImageSlotCreationAttributes> implements UserImageSlotAttributes {
  public id!: number;
  public userId!: number;
  public slot!: number;
  public userImageId!: number;
  public assignedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserImageSlot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    slot: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userImageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'user_images', key: 'id' },
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'UserImageSlot',
    tableName: 'user_image_slots',
    timestamps: true,
  }
);

UserImageSlot.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserImageSlot.belongsTo(UserImage, { foreignKey: 'userImageId', as: 'image' });

export default UserImageSlot;








