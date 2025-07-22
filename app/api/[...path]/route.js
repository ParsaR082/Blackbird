// Force all API routes to be dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

// This is a catch-all route handler for API routes
// It will ensure that any route not explicitly defined is handled properly
export async function GET(request, { params }) {
  return new Response(
    JSON.stringify({ 
      error: "Not Found",
      message: `API route '/${params.path.join('/')}' not found` 
    }),
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

export async function POST(request, { params }) {
  return new Response(
    JSON.stringify({ 
      error: "Not Found",
      message: `API route '/${params.path.join('/')}' not found` 
    }),
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

export async function PUT(request, { params }) {
  return new Response(
    JSON.stringify({ 
      error: "Not Found",
      message: `API route '/${params.path.join('/')}' not found` 
    }),
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}

export async function DELETE(request, { params }) {
  return new Response(
    JSON.stringify({ 
      error: "Not Found",
      message: `API route '/${params.path.join('/')}' not found` 
    }),
    { 
      status: 404,
      headers: { 'Content-Type': 'application/json' } 
    }
  );
} 