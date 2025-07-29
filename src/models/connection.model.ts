import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';

export interface ConnectionAttributes {
  id: number;
  userId1: number;
  userId2: number;
  status: 'requested' | 'connected' | 'blocked';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConnectionCreationAttributes extends Optional<ConnectionAttributes, 'id'> {}

class Connection extends Model<ConnectionAttributes, ConnectionCreationAttributes> implements ConnectionAttributes {
  public id!: number;
  public userId1!: number;
  public userId2!: number;
  public status!: 'requested' | 'connected' | 'blocked';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Connection.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    userId2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('requested', 'connected', 'blocked'),
      allowNull: false,
      defaultValue: 'requested',
    },
  },
  {
    sequelize,
    modelName: 'Connection',
    tableName: 'connections',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId1', 'userId2'],
      },
      {
        fields: ['userId1'],
      },
      {
        fields: ['userId2'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

// Associations will be set up in associations.ts

export default Connection; 