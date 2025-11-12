"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const user_model_1 = __importDefault(require("../models/user.model"));
const university_model_1 = __importDefault(require("../models/university.model"));
const associations_1 = require("../models/associations");
// Setup model associations
(0, associations_1.setupAssociations)();
const testUsers = [
    {
        email: 'priya.sharma_2024@iitm.ac.in',
        name: 'Priya Sharma',
        universityId: 1, // IIT Madras
        degree: 'Computer Science',
        year: '4th',
        gender: 'Female',
        dateOfBirth: new Date('2002-03-15'),
        skills: ['Python', 'Machine Learning', 'Data Science', 'React', 'Node.js'],
        aboutMe: 'Passionate about AI and machine learning. Love building innovative solutions that make a difference.',
        sports: 'Cricket, Badminton',
        movies: 'Inception, Interstellar, The Dark Knight',
        tvShows: 'Breaking Bad, Stranger Things, The Crown',
        teams: 'Mumbai Indians, Chennai Super Kings',
        portfolioLink: 'https://priyasharma.dev',
        phoneNumber: '9876543210',
        isEmailVerified: true,
        isProfileComplete: true
    },
    {
        email: 'rahul.kumar_2023@iitd.ac.in',
        name: 'Rahul Kumar',
        universityId: 2, // IIT Delhi
        degree: 'Electrical Engineering',
        year: '3rd',
        gender: 'Male',
        dateOfBirth: new Date('2003-07-22'),
        skills: ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes'],
        aboutMe: 'Full-stack developer with a passion for scalable architecture. Love solving complex problems.',
        sports: 'Football, Cricket',
        movies: 'Avengers, Spider-Man, Iron Man',
        tvShows: 'Game of Thrones, Money Heist, The Boys',
        teams: 'Manchester United, Real Madrid',
        portfolioLink: 'https://rahulkumar.tech',
        phoneNumber: '9876543211',
        isEmailVerified: true,
        isProfileComplete: true
    },
    {
        email: 'neha.patel_2024@iitb.ac.in',
        name: 'Neha Patel',
        universityId: 3, // IIT Bombay
        degree: 'Computer Science',
        year: '4th',
        gender: 'Female',
        dateOfBirth: new Date('2002-11-08'),
        skills: ['JavaScript', 'React', 'TypeScript', 'GraphQL', 'AWS'],
        aboutMe: 'Frontend specialist with an eye for design. Creating beautiful and functional user experiences.',
        sports: 'Tennis, Swimming',
        movies: 'La La Land, The Greatest Showman, Mamma Mia',
        tvShows: 'Friends, The Office, Parks and Recreation',
        teams: 'Roger Federer, Rafael Nadal',
        portfolioLink: 'https://nehapatel.design',
        phoneNumber: '9876543212',
        isEmailVerified: true,
        isProfileComplete: true
    },
    {
        email: 'arjun.singh_2023@iitk.ac.in',
        name: 'Arjun Singh',
        universityId: 4, // IIT Kanpur
        degree: 'Mechanical Engineering',
        year: '3rd',
        gender: 'Male',
        dateOfBirth: new Date('2003-01-30'),
        skills: ['SolidWorks', 'AutoCAD', 'MATLAB', 'Python', 'Arduino'],
        aboutMe: 'Mechanical engineer with a love for robotics and automation. Building the future one project at a time.',
        sports: 'Basketball, Volleyball',
        movies: 'Transformers, Pacific Rim, Terminator',
        tvShows: 'Westworld, Black Mirror, Altered Carbon',
        teams: 'Golden State Warriors, LA Lakers',
        portfolioLink: 'https://arjunsingh.me',
        phoneNumber: '9876543213',
        isEmailVerified: true,
        isProfileComplete: true
    },
    {
        email: 'kavya.reddy_2024@iitkgp.ac.in',
        name: 'Kavya Reddy',
        universityId: 5, // IIT Kharagpur
        degree: 'Computer Science',
        year: '4th',
        gender: 'Female',
        dateOfBirth: new Date('2002-05-12'),
        skills: ['C++', 'Competitive Programming', 'Algorithms', 'System Design', 'Linux'],
        aboutMe: 'Competitive programmer and system designer. Love solving algorithmic challenges and building robust systems.',
        sports: 'Chess, Table Tennis',
        movies: 'The Matrix, Blade Runner, Ex Machina',
        tvShows: 'Silicon Valley, Mr. Robot, Devs',
        teams: 'Magnus Carlsen, Hikaru Nakamura',
        portfolioLink: 'https://kavyareddy.codes',
        phoneNumber: '9876543214',
        isEmailVerified: true,
        isProfileComplete: true
    },
    {
        email: 'vikram.malhotra_2023@iitr.ac.in',
        name: 'Vikram Malhotra',
        universityId: 6, // IIT Roorkee
        degree: 'Civil Engineering',
        year: '3rd',
        gender: 'Male',
        dateOfBirth: new Date('2003-09-18'),
        skills: ['AutoCAD', 'Revit', 'STAAD Pro', 'SketchUp', 'Project Management'],
        aboutMe: 'Civil engineer passionate about sustainable infrastructure. Building tomorrow\'s cities with innovation.',
        sports: 'Cricket, Football',
        movies: 'The Shawshank Redemption, Forrest Gump, The Green Mile',
        tvShows: 'Breaking Bad, Better Call Saul, Ozark',
        teams: 'India National Team, Barcelona',
        portfolioLink: 'https://vikrammalhotra.engineer',
        phoneNumber: '9876543215',
        isEmailVerified: true,
        isProfileComplete: true
    },
    {
        email: 'ananya.gupta_2024@iitg.ac.in',
        name: 'Ananya Gupta',
        universityId: 7, // IIT Guwahati
        degree: 'Chemical Engineering',
        year: '4th',
        gender: 'Female',
        dateOfBirth: new Date('2002-12-03'),
        skills: ['MATLAB', 'Aspen Plus', 'Python', 'Data Analysis', 'Process Design'],
        aboutMe: 'Chemical engineer focused on sustainable processes and green technology. Making chemistry work for the environment.',
        sports: 'Badminton, Yoga',
        movies: 'The Lion King, Moana, Frozen',
        tvShows: 'The Good Place, Brooklyn Nine-Nine, Modern Family',
        teams: 'PV Sindhu, Saina Nehwal',
        portfolioLink: 'https://ananyagupta.chem',
        phoneNumber: '9876543216',
        isEmailVerified: true,
        isProfileComplete: true
    },
    {
        email: 'aditya.verma_2023@iith.ac.in',
        name: 'Aditya Verma',
        universityId: 8, // IIT Hyderabad
        degree: 'Computer Science',
        year: '3rd',
        gender: 'Male',
        dateOfBirth: new Date('2003-04-25'),
        skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Celery'],
        aboutMe: 'Backend developer with expertise in scalable web applications. Love building robust APIs and databases.',
        sports: 'Cricket, Table Tennis',
        movies: 'Inception, The Prestige, Memento',
        tvShows: 'Dark, The OA, Russian Doll',
        teams: 'Mumbai Indians, Chennai Super Kings',
        portfolioLink: 'https://adityaverma.dev',
        phoneNumber: '9876543217',
        isEmailVerified: true,
        isProfileComplete: true
    },
    {
        email: 'isha.kapoor_2024@nitt.edu',
        name: 'Isha Kapoor',
        universityId: 9, // NIT Tiruchirappalli
        degree: 'Information Technology',
        year: '4th',
        gender: 'Female',
        dateOfBirth: new Date('2002-08-14'),
        skills: ['JavaScript', 'React Native', 'Firebase', 'MongoDB', 'Node.js'],
        aboutMe: 'Mobile app developer creating innovative solutions. Passionate about user experience and clean code.',
        sports: 'Dance, Swimming',
        movies: 'La La Land, The Greatest Showman, A Star is Born',
        tvShows: 'Glee, Empire, Nashville',
        teams: 'BTS, Blackpink',
        portfolioLink: 'https://ishakapoor.app',
        phoneNumber: '9876543218',
        isEmailVerified: true,
        isProfileComplete: true
    },
    {
        email: 'rohan.sharma_2023@iitbhu.ac.in',
        name: 'Rohan Sharma',
        universityId: 10, // IIT Varanasi (BHU)
        degree: 'Electronics Engineering',
        year: '3rd',
        gender: 'Male',
        dateOfBirth: new Date('2003-06-07'),
        skills: ['VLSI Design', 'Verilog', 'FPGA', 'Embedded Systems', 'IoT'],
        aboutMe: 'Electronics engineer specializing in VLSI and embedded systems. Building the hardware of tomorrow.',
        sports: 'Cricket, Football',
        movies: 'Iron Man, Captain America, Thor',
        tvShows: 'The Flash, Arrow, Supergirl',
        teams: 'India National Team, Real Madrid',
        portfolioLink: 'https://rohansharma.tech',
        phoneNumber: '9876543219',
        isEmailVerified: true,
        isProfileComplete: true
    }
];
async function createTestUsers() {
    try {
        console.log('Starting to create test users...');
        // Check if universities exist
        const allUniversities = await university_model_1.default.findAll();
        console.log(`Found ${allUniversities.length} universities in database`);
        if (allUniversities.length === 0) {
            console.log('No universities found. Please run the university seeder first.');
            return;
        }
        // Create test users
        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await user_model_1.default.findOne({ where: { email: userData.email } });
            if (existingUser) {
                console.log(`User ${userData.name} already exists, skipping...`);
                continue;
            }
            // Create new user
            const user = await user_model_1.default.create(userData);
            console.log(`✅ Created user: ${user.name} (${user.email})`);
        }
        console.log('\n🎉 Test users created successfully!');
        console.log(`Total users in database: ${await user_model_1.default.count()}`);
        // Show some statistics
        console.log('\n📊 Users by University:');
        for (const university of allUniversities) {
            const count = await user_model_1.default.count({ where: { universityId: university.id } });
            if (count > 0) {
                console.log(`- ${university.name}: ${count} users`);
            }
        }
    }
    catch (error) {
        console.error('Error creating test users:', error);
    }
    finally {
        process.exit(0);
    }
}
createTestUsers();
