import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('bearer_token')?.value || null;
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || await getAuthToken();

  if (!token) {
    console.log("GET /api/chat/history - No token found");
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    
    console.log("Fetching chat history from backend");
    
    const response = await fetch(`${BACKEND_URL}/api/chat/history?limit=${limit}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Backend chat history response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch chat history from backend:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}
