"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user.model"));
const university_model_1 = __importDefault(require("../models/university.model"));
const sequelize_1 = require("sequelize");
// Year mapping from frontend to database values
const YEAR_MAPPING = {
    'First': '1st',
    'Second': '2nd',
    'Third': '3rd',
    'Fourth': '4th',
    '1st': '1st',
    '2nd': '2nd',
    '3rd': '3rd',
    '4th': '4th'
};
async function testYearsFilter() {
    try {
        console.log('🧪 Testing Years Filter...');
        // Test with "Second" (frontend value)
        const yearsFilter = 'Second';
        const mappedYears = [yearsFilter].map(year => YEAR_MAPPING[year] || year);
        console.log(`Frontend year: ${yearsFilter}`);
        console.log(`Mapped to database: ${mappedYears}`);
        // Query users with the mapped year
        const users = await user_model_1.default.findAll({
            where: {
                year: { [sequelize_1.Op.in]: mappedYears },
                isProfileComplete: true
            },
            include: [{
                    model: university_model_1.default,
                    as: 'university'
                }],
            limit: 10
        });
        console.log(`\n📊 Results for year filter "${yearsFilter}":`);
        console.log(`Found ${users.length} users`);
        users.forEach((user, index) => {
            var _a;
            console.log(`${index + 1}. ${user.name} - ${user.year} year - ${(_a = user.university) === null || _a === void 0 ? void 0 : _a.name}`);
        });
        // Also test with "2nd" directly
        console.log('\n🧪 Testing with "2nd" directly:');
        const usersDirect = await user_model_1.default.findAll({
            where: {
                year: '2nd',
                isProfileComplete: true
            },
            include: [{
                    model: university_model_1.default,
                    as: 'university'
                }],
            limit: 10
        });
        console.log(`Found ${usersDirect.length} users with "2nd" year`);
        // Show all available years in database
        console.log('\n📋 All available years in database:');
        const allYears = await user_model_1.default.findAll({
            where: {
                year: { [sequelize_1.Op.ne]: null }
            },
            attributes: ['year'],
            group: ['year'],
            order: [['year', 'ASC']]
        });
        allYears.forEach((year) => {
            console.log(`- ${year.year}`);
        });
    }
    catch (error) {
        console.error('❌ Error testing years filter:', error);
    }
}
testYearsFilter();
