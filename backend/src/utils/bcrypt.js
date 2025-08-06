const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Error processing password');
  }
};

const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Error verifying password');
  }
};

const generateSalt = async () => {
  try {
    return await bcrypt.genSalt(SALT_ROUNDS);
  } catch (error) {
    console.error('Error generating salt:', error);
    throw new Error('Error generating salt');
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateSalt
};