// Proxy all auth requests to the backend API
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function proxyToBackend(req, method) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/auth', '/api/auth');
  const backendUrl = `${BACKEND_URL}${path}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!['host', 'connection'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const options = {
    method,
    headers,
  };

  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    options.body = await req.text();
  }

  const response = await fetch(backendUrl, options);
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    responseHeaders.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = async (req) => {
  return proxyToBackend(req, 'GET');
};

export const POST = async (req) => {
  return proxyToBackend(req, 'POST');
};
