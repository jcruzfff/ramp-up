import { NextRequest, NextResponse } from 'next/server';

// In a real application, this would be stored in a database
// Comment out the mock projects so we can test creating real projects
// let projects = [
//   {
//     id: '1',
//     title: 'Clean Ocean Initiative',
//     description: 'Help remove plastic waste from our oceans and protect marine life',
//     imageSrc: 'https://images.unsplash.com/photo-1565214975484-3cfa9e56f914',
//     goalAmount: 10000,
//     currentAmount: 3750,
//     category: 'Environment',
//     donorCount: 14,
//     daysLeft: 12,
//     ownerAddress: 'GDYULVJK2T6G7HFUC5H3VFOF6TLZCJ4CEUV3WT4DPZRKVNWVWNGZUPKJ'
//   },
//   {
//     id: '2',
//     title: 'Education for All',
//     description: 'Providing educational resources to underprivileged communities',
//     imageSrc: 'https://images.unsplash.com/photo-1503676382389-4809596d5290',
//     goalAmount: 5000,
//     currentAmount: 2200,
//     category: 'Education',
//     donorCount: 8,
//     daysLeft: 30,
//     ownerAddress: 'GDYULVJK2T6G7HFUC5H3VFOF6TLZCJ4CEUV3WT4DPZRKVNWVWNGZUPKJ'
//   }
// ];

// Start with an empty array
let projects: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ownerAddress = searchParams.get('ownerAddress');
    
    // Return a specific project by ID
    if (id) {
      const project = projects.find(p => p.id === id);
      
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ project });
    }
    
    // Return projects for a specific owner
    if (ownerAddress) {
      const ownerProjects = projects.filter(p => p.ownerAddress === ownerAddress);
      return NextResponse.json({ projects: ownerProjects });
    }
    
    // Return all projects
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error retrieving projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.ownerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate a new unique ID
    const id = (projects.length + 1).toString();
    
    // Create a new project with defaults for missing fields
    const newProject = {
      id,
      title: body.title,
      description: body.description,
      imageSrc: body.imageSrc || 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3',
      goalAmount: body.goalAmount || 1000,
      currentAmount: 0,
      category: Array.isArray(body.categories) && body.categories.length > 0 
        ? body.categories[0] 
        : 'Other', // For backward compatibility
      categories: Array.isArray(body.categories) ? body.categories : ['Other'],
      donorCount: 0,
      daysLeft: body.daysUntilDeadline || 30,
      ownerAddress: body.ownerAddress
    };
    
    // Add to our projects array
    projects.push(newProject);
    
    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update projects without removing them
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const projectIndex = projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Update only the provided fields
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...body
    };
    
    return NextResponse.json({ project: projects[projectIndex] });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 