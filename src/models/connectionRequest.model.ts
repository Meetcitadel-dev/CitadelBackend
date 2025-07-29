import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface ConnectionRequestAttributes {
  id: number;
  requesterId: number;
  targetId: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConnectionRequestCreationAttributes extends Optional<ConnectionRequestAttributes, 'id'> {}

class ConnectionRequest extends Model<ConnectionRequestAttributes, ConnectionRequestCreationAttributes> implements ConnectionRequestAttributes {
  public id!: number;
  public requesterId!: number;
  public targetId!: number;
  public status!: 'pending' | 'accepted' | 'rejected';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConnectionRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'requester_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'ConnectionRequest',
    tableName: 'connection_requests',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['requester_id', 'target_id'],
        name: 'unique_connection_request'
      },
      {
        fields: ['requester_id'],
      },
      {
        fields: ['target_id'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default ConnectionRequest;