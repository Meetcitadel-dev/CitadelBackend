"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
console.log('DB CONFIG:', {
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT
});
const sequelize = new sequelize_1.Sequelize(process.env.POSTGRES_DB || 'citadel', process.env.POSTGRES_USER || 'postgres', process.env.POSTGRES_PASSWORD || 'Passwordcitadel', {
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
});
exports.default = sequelize;
