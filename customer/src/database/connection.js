import mongoose from 'mongoose';
import config from '../config/index.js';

const connectToDatabase = async () => {
  try {
    await mongoose.connect(config.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to database:');
    console.error(error);
    process.exit(1);
  }
};

export default connectToDatabase;
