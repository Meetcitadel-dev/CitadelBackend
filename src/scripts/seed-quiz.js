require('dotenv').config();
const mongoose = require('mongoose');

// Define Quiz schema
const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  points: { type: Number, required: true }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

const sampleQuestions = [
  {
    question: "What is your preferred way to spend a weekend?",
    options: ["Reading books", "Going out with friends", "Watching movies", "Playing sports"],
    correctAnswer: 1,
    category: "lifestyle",
    difficulty: "easy",
    points: 1
  },
  {
    question: "Which subject interests you most?",
    options: ["Science", "Arts", "Business", "Technology"],
    correctAnswer: 2,
    category: "academic",
    difficulty: "easy",
    points: 1
  },
  {
    question: "How do you prefer to communicate?",
    options: ["Face-to-face", "Text messages", "Video calls", "Phone calls"],
    correctAnswer: 0,
    category: "personality",
    difficulty: "easy",
    points: 1
  },
  {
    question: "What motivates you most?",
    options: ["Money", "Recognition", "Learning", "Helping others"],
    correctAnswer: 2,
    category: "personality",
    difficulty: "medium",
    points: 2
  },
  {
    question: "How do you handle stress?",
    options: ["Exercise", "Meditation", "Talking to friends", "Listening to music"],
    correctAnswer: 1,
    category: "personality",
    difficulty: "medium",
    points: 2
  },
  {
    question: "What's your ideal work environment?",
    options: ["Quiet office", "Open workspace", "Remote work", "Flexible hours"],
    correctAnswer: 3,
    category: "lifestyle",
    difficulty: "medium",
    points: 2
  },
  {
    question: "Which skill would you like to develop most?",
    options: ["Public speaking", "Programming", "Design", "Leadership"],
    correctAnswer: 1,
    category: "interests",
    difficulty: "medium",
    points: 2
  },
  {
    question: "How do you prefer to learn new things?",
    options: ["Hands-on practice", "Reading documentation", "Video tutorials", "Group discussions"],
    correctAnswer: 0,
    category: "academic",
    difficulty: "medium",
    points: 2
  },
  {
    question: "What's your approach to problem-solving?",
    options: ["Analyze first", "Try different solutions", "Ask for help", "Research online"],
    correctAnswer: 0,
    category: "personality",
    difficulty: "hard",
    points: 3
  },
  {
    question: "How do you stay updated with current events?",
    options: ["News websites", "Social media", "Podcasts", "Newspapers"],
    correctAnswer: 0,
    category: "interests",
    difficulty: "hard",
    points: 3
  },
  {
    question: "What's your ideal team size for projects?",
    options: ["2-3 people", "4-6 people", "7-10 people", "10+ people"],
    correctAnswer: 1,
    category: "lifestyle",
    difficulty: "hard",
    points: 3
  },
  {
    question: "How do you prefer to give feedback?",
    options: ["Direct and honest", "Gentle and supportive", "Written form", "In group settings"],
    correctAnswer: 0,
    category: "personality",
    difficulty: "hard",
    points: 3
  }
];

async function seedQuiz() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/citadel');
    console.log('✅ Connected to MongoDB');

    // Clear existing quiz questions
    await Quiz.deleteMany({});
    console.log('✅ Cleared existing quiz questions');

    // Insert sample questions
    await Quiz.insertMany(sampleQuestions);
    console.log('✅ Added sample quiz questions');

    console.log('✅ Quiz seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding quiz:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedQuiz();
