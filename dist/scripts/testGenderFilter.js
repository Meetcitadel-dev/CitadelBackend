"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const sequelize_1 = require("sequelize");
async function testGenderFilter() {
    try {
        console.log('🧪 Testing Gender Filter...');
        // Check all users and their genders
        console.log('\n📋 All users and their genders:');
        const allUsers = await user_model_1.default.findAll({
            where: {
                isProfileComplete: true
            },
            attributes: ['id', 'name', 'gender', 'year']
        });
        allUsers.forEach((user) => {
            console.log(`${user.id}. ${user.name} - Gender: "${user.gender}" - Year: ${user.year}`);
        });
        // Check unique gender values
        console.log('\n🔍 Unique gender values in database:');
        const uniqueGenders = await user_model_1.default.findAll({
            where: {
                gender: { [sequelize_1.Op.ne]: null }
            },
            attributes: ['gender'],
            group: ['gender'],
            order: [['gender', 'ASC']]
        });
        uniqueGenders.forEach((gender) => {
            console.log(`- "${gender.gender}"`);
        });
        // Test female filter specifically
        console.log('\n👩 Testing female filter:');
        const femaleUsers = await user_model_1.default.findAll({
            where: {
                gender: 'female',
                isProfileComplete: true
            }
        });
        console.log(`Found ${femaleUsers.length} users with gender='female'`);
        femaleUsers.forEach((user) => {
            console.log(`- ${user.name} (${user.gender})`);
        });
        // Test case-insensitive search
        console.log('\n🔍 Testing case variations:');
        const femaleLower = await user_model_1.default.findAll({
            where: {
                gender: 'Female',
                isProfileComplete: true
            }
        });
        console.log(`Found ${femaleLower.length} users with gender='Female'`);
        const femaleUpper = await user_model_1.default.findAll({
            where: {
                gender: 'FEMALE',
                isProfileComplete: true
            }
        });
        console.log(`Found ${femaleUpper.length} users with gender='FEMALE'`);
    }
    catch (error) {
        console.error('❌ Error testing gender filter:', error);
    }
}
testGenderFilter();
