import { Sequelize } from 'sequelize';

const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

let sequelize: Sequelize;

if (config.url) {
  sequelize = new Sequelize(config.url, config);
} else {
  throw new Error('Database URL is not defined');
}

export default sequelize;

// Test connection
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

// Close connection
export async function closeConnection() {
  await sequelize.close();
}
