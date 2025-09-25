import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';

export interface GroupAttributes {
  id: number;
  name: string;
  description?: string;
  avatarUrl?: string;
  createdBy: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupCreationAttributes extends Optional<GroupAttributes, 'id' | 'isActive'> {}

class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public avatarUrl!: string;
  public createdBy!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Group',
    tableName: 'groups',
    timestamps: true,
    indexes: [
      {
        fields: ['createdBy'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

// Associations will be set up in associations.ts

export default Group;




























