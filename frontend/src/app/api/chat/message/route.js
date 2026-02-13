import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('bearer_token')?.value || null;
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || await getAuthToken();

  if (!token) {
    console.log("POST /api/chat/message - No token found");
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Sending chat message to backend");
    
    const response = await fetch(`${BACKEND_URL}/api/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log("Backend chat response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to send chat message to backend:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}
