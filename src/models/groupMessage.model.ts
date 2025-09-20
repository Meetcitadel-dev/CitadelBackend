import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';
import Group from './group.model';

export interface GroupMessageAttributes {
  id: number;
  groupId: number;
  senderId: number;
  content: string;
  messageType: string;
  isEdited: boolean;
  editedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupMessageCreationAttributes extends Optional<GroupMessageAttributes, 'id' | 'messageType' | 'isEdited'> {}

class GroupMessage extends Model<GroupMessageAttributes, GroupMessageCreationAttributes> implements GroupMessageAttributes {
  public id!: number;
  public groupId!: number;
  public senderId!: number;
  public content!: string;
  public messageType!: string;
  public isEdited!: boolean;
  public editedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GroupMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id',
      },
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'text',
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'GroupMessage',
    tableName: 'group_messages',
    timestamps: true,
    indexes: [
      {
        fields: ['groupId'],
      },
      {
        fields: ['senderId'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

// Associations will be set up in associations.ts

export default GroupMessage;
























