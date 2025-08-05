import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';

export interface AdjectiveSelectionAttributes {
  id: string;
  userId: number;
  targetUserId: number;
  adjective: string;
  timestamp: Date;
  isMatched: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdjectiveSelectionCreationAttributes extends Optional<AdjectiveSelectionAttributes, 'id' | 'isMatched'> {}

class AdjectiveSelection extends Model<AdjectiveSelectionAttributes, AdjectiveSelectionCreationAttributes> implements AdjectiveSelectionAttributes {
  public id!: string;
  public userId!: number;
  public targetUserId!: number;
  public adjective!: string;
  public timestamp!: Date;
  public isMatched!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AdjectiveSelection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    targetUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    adjective: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    isMatched: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'AdjectiveSelection',
    tableName: 'adjective_selections',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'targetUserId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['targetUserId'],
      },
      {
        fields: ['adjective'],
      },
      {
        fields: ['isMatched'],
      },
    ],
  }
);

export default AdjectiveSelection; 