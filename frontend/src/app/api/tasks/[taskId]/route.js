import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('bearer_token')?.value || null;
}

export async function GET(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || await getAuthToken();

  if (!token) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks/${taskId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || await getAuthToken();

  if (!token) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks/${taskId}`, {
      method: "PUT",
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
    console.error("Failed to update task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || await getAuthToken();

  if (!token) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || await getAuthToken();

  if (!token) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks/${taskId}/complete`, {
      method: "PATCH",
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
    console.error("Failed to toggle task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}
