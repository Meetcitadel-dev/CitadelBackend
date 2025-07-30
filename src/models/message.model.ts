import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface MessageAttributes {
  id: string;
  conversationId: string;
  senderId: number;
  text: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'status'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string;
  public conversationId!: string;
  public senderId!: number;
  public text!: string;
  public status!: 'sent' | 'delivered' | 'read';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id',
      },
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read'),
      allowNull: false,
      defaultValue: 'sent',
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
    indexes: [
      {
        fields: ['conversationId', 'createdAt'],
      },
      {
        fields: ['senderId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Message; 