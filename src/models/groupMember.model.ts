import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';
import Group from './group.model';

export interface GroupMemberAttributes {
  id: number;
  groupId: number;
  userId: number;
  isAdmin: boolean;
  joinedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupMemberCreationAttributes extends Optional<GroupMemberAttributes, 'id' | 'isAdmin' | 'joinedAt'> {}

class GroupMember extends Model<GroupMemberAttributes, GroupMemberCreationAttributes> implements GroupMemberAttributes {
  public id!: number;
  public groupId!: number;
  public userId!: number;
  public isAdmin!: boolean;
  public joinedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GroupMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'GroupMember',
    tableName: 'group_members',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['groupId', 'userId'],
      },
      {
        fields: ['groupId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['isAdmin'],
      },
    ],
  }
);

// Associations will be set up in associations.ts

export default GroupMember;




















