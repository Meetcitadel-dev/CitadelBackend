import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';

export interface MatchAttributes {
  id: string;
  userId1: number;
  userId2: number;
  mutualAdjective: string;
  isConnected: boolean;
  matchTimestamp: Date;
  connectionTimestamp?: Date;
  iceBreakingPrompt?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MatchCreationAttributes extends Optional<MatchAttributes, 'id' | 'isConnected'> {}

class Match extends Model<MatchAttributes, MatchCreationAttributes> implements MatchAttributes {
  public id!: string;
  public userId1!: number;
  public userId2!: number;
  public mutualAdjective!: string;
  public isConnected!: boolean;
  public matchTimestamp!: Date;
  public connectionTimestamp?: Date;
  public iceBreakingPrompt?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Match.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    mutualAdjective: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isConnected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    matchTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    connectionTimestamp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    iceBreakingPrompt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Match',
    tableName: 'matches',
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
        fields: ['isConnected'],
      },
      {
        fields: ['mutualAdjective'],
      },
    ],
  }
);

export default Match; 