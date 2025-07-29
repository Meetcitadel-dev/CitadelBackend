import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';

export interface AdjectiveMatchAttributes {
  id: number;
  userId1: number;
  userId2: number;
  adjective: string;
  timestamp?: Date;
  matched: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdjectiveMatchCreationAttributes extends Optional<AdjectiveMatchAttributes, 'id' | 'matched'> {}

class AdjectiveMatch extends Model<AdjectiveMatchAttributes, AdjectiveMatchCreationAttributes> implements AdjectiveMatchAttributes {
  public id!: number;
  public userId1!: number;
  public userId2!: number;
  public adjective!: string;
  public timestamp?: Date;
  public matched!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AdjectiveMatch.init(
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
    adjective: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    matched: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'AdjectiveMatch',
    tableName: 'adjective_matches',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId1', 'userId2', 'adjective'],
      },
      {
        fields: ['userId1'],
      },
      {
        fields: ['userId2'],
      },
      {
        fields: ['adjective'],
      },
      {
        fields: ['matched'],
      },
    ],
  }
);

// Associations will be set up in associations.ts

export default AdjectiveMatch; 