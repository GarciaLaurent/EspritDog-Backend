import dotenv from 'dotenv';
dotenv.config();
const buildMongoURI = () => {
  let connectionString = 'mongodb://';

  if (process.env.DB_USERNAME && process.env.DB_PASSWORD) {
    connectionString += `${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@`;
  }

  connectionString += `${process.env.DB_HOST}:${process.env.DB_PORT || 27017}/${
    process.env.DB_NAME
  }`;
  return connectionString;
};
export const MONGODB_URI = buildMongoURI();
