import { auth } from "@/lib/auth";

export const GET = async (req) => {
  const handler = auth.handler;
  if (typeof handler === "function") {
    return handler(req);
  }
  if (handler && typeof handler.GET === "function") {
    return handler.GET(req);
  }
  return new Response("Better Auth Handler Error: GET method not found on auth.handler", { status: 500 });
};

export const POST = async (req) => {
  const handler = auth.handler;
  if (typeof handler === "function") {
    return handler(req);
  }
  if (handler && typeof handler.POST === "function") {
    return handler.POST(req);
  }
  return new Response("Better Auth Handler Error: POST method not found on auth.handler", { status: 500 });
};
