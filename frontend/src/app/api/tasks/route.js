import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function getAuthToken() {
  const cookieStore = await cookies();
  // Try to get token from cookie or localStorage (passed via header)
  return cookieStore.get('bearer_token')?.value || null;
}

export async function GET(request) {
  // Get token from Authorization header or cookie
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || await getAuthToken();

  if (!token) {
    console.log("GET /api/tasks - No token found");
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    console.log("Fetching tasks from backend");
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch tasks from backend:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || await getAuthToken();

  if (!token) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to create task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}
