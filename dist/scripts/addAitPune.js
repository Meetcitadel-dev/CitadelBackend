"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const university_model_1 = __importDefault(require("../models/university.model"));
const sequelize_1 = require("sequelize");
async function addAitPune() {
    try {
        await db_1.default.authenticate();
        console.log('Database connection established successfully.');
        // Check if AIT Pune already exists
        const existingUniversity = await university_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { name: 'Army Institute of Technology, Pune' },
                    { name: 'AIT Pune' },
                    { domain: 'aitpune.edu.in' }
                ]
            }
        });
        if (existingUniversity) {
            console.log('AIT Pune already exists in the database:', existingUniversity.toJSON());
            return;
        }
        // Add AIT Pune
        const newUniversity = await university_model_1.default.create({
            name: 'Army Institute of Technology, Pune',
            domain: 'aitpune.edu.in',
            country: 'India'
        });
        console.log('AIT Pune added successfully:', newUniversity.toJSON());
    }
    catch (error) {
        console.error('Error adding AIT Pune:', error);
    }
    finally {
        await db_1.default.close();
    }
}
addAitPune();
