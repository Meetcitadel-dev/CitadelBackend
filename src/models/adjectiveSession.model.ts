import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface AdjectiveSessionAttributes {
  id: string;
  userId: number;
  targetUserId: number;
  sessionId: string;
  adjectives: string[]; // Array of 4 adjectives
  createdAt: Date;
  expiresAt: Date;
}

export interface AdjectiveSessionCreationAttributes extends Optional<AdjectiveSessionAttributes, 'id' | 'createdAt' | 'expiresAt'> {}

class AdjectiveSession extends Model<AdjectiveSessionAttributes, AdjectiveSessionCreationAttributes> implements AdjectiveSessionAttributes {
  public id!: string;
  public userId!: number;
  public targetUserId!: number;
  public sessionId!: string;
  public adjectives!: string[];
  public readonly createdAt!: Date;
  public readonly expiresAt!: Date;
}

AdjectiveSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    targetUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'session_id',
    },
    adjectives: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'expires_at',
    },
  },
  {
    sequelize,
    modelName: 'AdjectiveSession',
    tableName: 'adjective_sessions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'targetUserId', 'sessionId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['targetUserId'],
      },
      {
        fields: ['sessionId'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
);

export default AdjectiveSession;
