import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function getSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session;
}

export async function GET(request, { params }) {
  const session = await getSession();

  if (!session) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks/${taskId}`, {
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": session.user.id,
      },
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const session = await getSession();

  if (!session) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": session.user.id,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to update task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession();

  if (!session) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": session.user.id,
      },
    });

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const session = await getSession();

  if (!session) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks/${taskId}/complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": session.user.id,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to toggle task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}
