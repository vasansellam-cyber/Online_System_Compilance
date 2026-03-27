const mongoose = require('mongoose');
const User = require('./models/User'); // Reusing your existing User model
require('dotenv').config();

const MONGO_URI = 'mongodb+srv://vasan:Anitha07@cluster0.7nglaqy.mongodb.net/Online_Compilance?retryWrites=true&w=majority&appName=Cluster0';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected directly to MongoDB Atlas cluster!');

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@onlinecompilance.com' });
    if (!existingUser) {
      console.log('Creating initial demo user to trigger database creation...');
      const user = new User({
        username: 'DemoUser',
        email: 'demo@onlinecompilance.com',
        password: 'hashedpassword', // Not using bcrypt here just for a quick insert
        role: 'user',
      });
      await user.save();
      console.log('Successfully inserted demo user into Online_Compilance database!');
    } else {
      console.log('Demo user already exists in Online_Compilance database.');
    }

  } catch (error) {
    console.error('Database connection or insertion error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDatabase();
