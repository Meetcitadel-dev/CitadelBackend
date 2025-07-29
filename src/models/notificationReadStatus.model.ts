import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface NotificationReadStatusAttributes {
  id: number;
  userId: number;
  notificationId: number;
  notificationType: 'connection_request' | 'adjective_notification';
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificationReadStatusCreationAttributes extends Optional<NotificationReadStatusAttributes, 'id' | 'isRead'> {}

class NotificationReadStatus extends Model<NotificationReadStatusAttributes, NotificationReadStatusCreationAttributes> implements NotificationReadStatusAttributes {
  public id!: number;
  public userId!: number;
  public notificationId!: number;
  public notificationType!: 'connection_request' | 'adjective_notification';
  public isRead!: boolean;
  public readAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NotificationReadStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    notificationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'notification_id',
    },
    notificationType: {
      type: DataTypes.ENUM('connection_request', 'adjective_notification'),
      allowNull: false,
      field: 'notification_type',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
    },
  },
  {
    sequelize,
    modelName: 'NotificationReadStatus',
    tableName: 'notification_read_status',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'notification_id', 'notification_type'],
        name: 'unique_notification_read'
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['notification_type'],
      },
      {
        fields: ['is_read'],
      },
    ],
  }
);

export default NotificationReadStatus;