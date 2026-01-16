import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

async function getSession() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    console.log("Session retrieved:", session ? "yes" : "no", session?.user?.id);
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function GET(request) {
  const session = await getSession();

  if (!session) {
    console.log("GET /api/tasks - No session found");
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    console.log("Fetching tasks for user:", session.user.id);
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks`, {
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": session.user.id,
      },
    });

    console.log("Backend response status:", response.status);
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch tasks from backend:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();

  if (!session) {
    return Response.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/v1/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": session.user.id,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to create task:", error);
    return Response.json({ detail: "Backend request failed" }, { status: 500 });
  }
}
