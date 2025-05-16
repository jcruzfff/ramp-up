import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handle DELETE request to clear all projects
export async function DELETE() {
  try {
    // Delete all projects from the database
    const result = await prisma.project.deleteMany({});
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'All projects have been cleared successfully',
      count: result.count
    }, { status: 200 });
  } catch (error) {
    console.error('Error clearing projects:', error);
    
    // Return error response
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear projects' 
    }, { status: 500 });
  } finally {
    // Disconnect from Prisma client
    await prisma.$disconnect();
  }
} 