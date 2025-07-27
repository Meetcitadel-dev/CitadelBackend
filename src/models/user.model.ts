import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface UserAttributes {
  id: number;
  email: string;
  isEmailVerified: boolean;
  otpAttempts: number;
  name?: string;
  universityId?: number;
  degree?: string;
  year?: string;
  gender?: string;
  dateOfBirth?: Date;
  skills?: string[];
  friends?: string[];
  isProfileComplete: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isEmailVerified' | 'otpAttempts' | 'isProfileComplete'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public isEmailVerified!: boolean;
  public otpAttempts!: number;
  public name?: string;
  public universityId?: number;
  public degree?: string;
  public year?: string;
  public gender?: string;
  public dateOfBirth?: Date;
  public skills?: string[];
  public friends?: string[];
  public isProfileComplete!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    otpAttempts: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    universityId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    friends: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isProfileComplete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User;















