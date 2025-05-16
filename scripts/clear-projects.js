#!/usr/bin/env node

/**
 * Clear Projects Script
 * 
 * This script clears all projects from the database.
 * It uses the API endpoint to delete all projects.
 */

const fetch = require('node-fetch');

async function clearProjects() {
  try {
    console.log('Clearing all projects...');
    
    // Send request to the API endpoint
    const response = await fetch('http://localhost:3000/api/projects/clear', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to clear projects');
    }
    
    const data = await response.json();
    console.log('Success:', data.message || 'All projects have been cleared');
    console.log(`Deleted ${data.count || 0} projects`);
  } catch (error) {
    console.error('Error clearing projects:', error.message);
    process.exit(1);
  }
}

clearProjects(); 