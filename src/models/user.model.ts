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
  aboutMe?: string;
  sports?: string;
  movies?: string;
  tvShows?: string;
  teams?: string;
  portfolioLink?: string;
  phoneNumber?: string;
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
  public aboutMe?: string;
  public sports?: string;
  public movies?: string;
  public tvShows?: string;
  public teams?: string;
  public portfolioLink?: string;
  public phoneNumber?: string;
  public isProfileComplete!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    universityId: {
      type: DataTypes.INTEGER,
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
    aboutMe: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'about_me',
    },
    sports: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'sports',
    },
    movies: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'movies',
    },
    tvShows: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'tv_shows',
    },
    teams: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'teams',
    },
    portfolioLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'portfolio_link',
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'phone_number',
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

// Associations will be set up in associations.ts

export default User;















