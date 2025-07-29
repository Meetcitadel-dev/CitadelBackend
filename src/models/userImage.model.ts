import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';

export interface UserImageAttributes {
  id: number;
  userId: number;
  s3Key: string;
  cloudfrontUrl: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserImageCreationAttributes extends Optional<UserImageAttributes, 'id'> {}

class UserImage extends Model<UserImageAttributes, UserImageCreationAttributes> implements UserImageAttributes {
  public id!: number;
  public userId!: number;
  public s3Key!: string;
  public cloudfrontUrl!: string;
  public originalName!: string;
  public mimeType!: string;
  public fileSize!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cloudfrontUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'UserImage',
    tableName: 'user_images',
    timestamps: true,
  }
);

// Define association (only one side to avoid circular dependency)
UserImage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default UserImage; 