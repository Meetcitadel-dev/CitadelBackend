import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';
import GroupMessage from './groupMessage.model';

export interface GroupMessageReadAttributes {
  id: number;
  messageId: number;
  userId: number;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupMessageReadCreationAttributes extends Optional<GroupMessageReadAttributes, 'id' | 'readAt'> {}

class GroupMessageRead extends Model<GroupMessageReadAttributes, GroupMessageReadCreationAttributes> implements GroupMessageReadAttributes {
  public id!: number;
  public messageId!: number;
  public userId!: number;
  public readAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GroupMessageRead.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'group_messages',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'GroupMessageRead',
    tableName: 'group_message_reads',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['messageId', 'userId'],
      },
      {
        fields: ['messageId'],
      },
      {
        fields: ['userId'],
      },
    ],
  }
);

// Associations will be set up in associations.ts

export default GroupMessageRead;



