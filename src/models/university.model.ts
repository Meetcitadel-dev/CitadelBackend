import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

export interface UniversityAttributes {
  id: number;
  name: string;
  domain: string;
  country: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UniversityCreationAttributes extends Optional<UniversityAttributes, 'id'> {}

class University extends Model<UniversityAttributes, UniversityCreationAttributes> implements UniversityAttributes {
  public id!: number;
  public name!: string;
  public domain!: string;
  public country!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

University.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'University',
    tableName: 'universities',
    timestamps: true,
    indexes: [
      {
        name: 'universities_name_idx',
        fields: ['name']
      },
      {
        name: 'universities_name_gin_idx',
        fields: ['name'],
        using: 'gin',
        operator: 'gin_trgm_ops'
      },
      {
        name: 'universities_domain_idx',
        fields: ['domain']
      },
      {
        name: 'universities_country_idx',
        fields: ['country']
      }
    ]
  }
);

export default University;
