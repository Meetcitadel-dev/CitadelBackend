import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface UserOnlineStatusAttributes {
  userId: number;
  isOnline: boolean;
  lastSeen: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserOnlineStatusCreationAttributes extends Optional<UserOnlineStatusAttributes, 'isOnline' | 'lastSeen'> {}

class UserOnlineStatus extends Model<UserOnlineStatusAttributes, UserOnlineStatusCreationAttributes> implements UserOnlineStatusAttributes {
  public userId!: number;
  public isOnline!: boolean;
  public lastSeen!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserOnlineStatus.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'UserOnlineStatus',
    tableName: 'user_online_status',
    timestamps: true,
    indexes: [
      {
        fields: ['isOnline', 'lastSeen'],
      },
    ],
  }
);

export default UserOnlineStatus; 