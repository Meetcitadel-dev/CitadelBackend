import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

export interface InteractionAttributes {
  id?: number;
  userId: number;
  targetUserId: number;
  interactionType: 'viewed' | 'connected' | 'adjective_selected' | 'blocked';
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InteractionCreationAttributes extends Omit<InteractionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Interaction extends Model<InteractionAttributes, InteractionCreationAttributes> implements InteractionAttributes {
  public id!: number;
  public userId!: number;
  public targetUserId!: number;
  public interactionType!: 'viewed' | 'connected' | 'adjective_selected' | 'blocked';
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Interaction.init(
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
    },
    targetUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_user_id',
    },
    interactionType: {
      type: DataTypes.ENUM('viewed', 'connected', 'adjective_selected', 'blocked'),
      allowNull: false,
      field: 'interaction_type',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'interactions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'target_user_id', 'interaction_type'],
        name: 'unique_user_interaction'
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['target_user_id']
      },
      {
        fields: ['timestamp']
      }
    ]
  }
);

export default Interaction;