import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface UserUnreadCountAttributes {
  id: number;
  userId: number;
  chatId: number;
  isGroup: boolean;
  unreadCount: number;
  lastMessageId?: number | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserUnreadCountCreationAttributes extends Optional<UserUnreadCountAttributes, 'id' | 'lastMessageId'> {}

class UserUnreadCount extends Model<UserUnreadCountAttributes, UserUnreadCountCreationAttributes> implements UserUnreadCountAttributes {
  public id!: number;
  public userId!: number;
  public chatId!: number;
  public isGroup!: boolean;
  public unreadCount!: number;
  public lastMessageId!: number | string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserUnreadCount.init(
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
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Group ID for group chats, User ID for direct chats',
    },
    isGroup: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'true for group chats, false for direct chats',
    },
    unreadCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastMessageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the last unread message',
    },
  },
  {
    sequelize,
    modelName: 'UserUnreadCount',
    tableName: 'user_unread_counts',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'chatId', 'isGroup'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['chatId'],
      },
      {
        fields: ['userId', 'chatId', 'isGroup'],
      },
    ],
  }
);

export default UserUnreadCount;
