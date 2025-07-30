import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface ConversationAttributes {
  id: string;
  user1Id: number;
  user2Id: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: string;
  public user1Id!: number;
  public user2Id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user1Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    user2Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conversations',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user1Id', 'user2Id'],
      },
      {
        fields: ['user1Id'],
      },
      {
        fields: ['user2Id'],
      },
    ],
  }
);

export default Conversation; 