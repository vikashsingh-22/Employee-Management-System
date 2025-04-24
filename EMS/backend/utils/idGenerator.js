/**
 * Utility function to generate unique employee IDs with retry logic
 * to handle potential duplicate IDs.
 */

const User = require('../Models/User');

/**
 * Generates a unique employee ID based on role and attempts to save the user
 * with retry logic if a duplicate ID is generated.
 * 
 * @param {Object} userData - The user data to save
 * @returns {Promise<Object>} - The saved user object
 */
async function createUserWithUniqueId(userData) {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    try {
      // Generate a new ID on each attempt
      const prefix = userData.role === 'manager' ? 'MAN-' : 'EMP-';
      const randomId = Math.floor(10000 + Math.random() * 90000);
      userData.employeeId = `${prefix}${randomId}`;
      
      // Try to save the user
      const newUser = await User.create(userData);
      return newUser;
    } catch (error) {
      // Check if it's a duplicate key error
      if (error.code === 11000 && error.keyPattern && error.keyPattern.employeeId) {
        attempts++;
        console.log(`Duplicate ID generated, retrying (${attempts}/${maxAttempts})...`);
      } else {
        // If it's a different error, throw it
        throw error;
      }
    }
  }
  
  // If we've exhausted all attempts
  throw new Error('Failed to generate a unique employee ID after multiple attempts');
}

module.exports = { createUserWithUniqueId };
