// Load environment variables from .env file
import dotenv from 'dotenv';

dotenv.config();

export default {
  development: {
    type: 'development',
    port: 3000,
    mongodb: process.env.MONGO_KEY
  },
  production: {
    type: 'production',
    port: 3000,
    mongodb: 'mongodb+srv://12345:12345@demo.v4muu5b.mongodb.net/ecole'
  }
};
