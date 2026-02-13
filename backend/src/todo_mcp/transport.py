"""SSE transport configuration for MCP server."""
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from mcp.server.sse import SseServerTransport
from .server import mcp_server
from .tools import register_tools
import asyncio


# Create router for MCP endpoints
mcp_router = APIRouter(prefix="/mcp", tags=["mcp"])


# Initialize MCP server with tools
server = mcp_server.get_server()
register_tools(server)


@mcp_router.get("/sse")
async def handle_sse(request: Request):
    """
    SSE endpoint for MCP communication.

    This endpoint establishes a Server-Sent Events connection for
    real-time bidirectional communication between the AI assistant
    and the MCP server.

    The connection remains open for the duration of the chat session,
    allowing the AI to invoke tools as needed.
    """
    transport = mcp_server.create_transport()

    async def event_generator():
        """Generate SSE events from MCP server."""
        try:
            async with transport.connect_sse(
                request.scope,
                request.receive,
                request._send
            ) as streams:
                # Run the server with the connected streams
                await server.run(
                    streams[0],
                    streams[1],
                    server.create_initialization_options()
                )
        except asyncio.CancelledError:
            # Client disconnected
            pass
        except Exception as e:
            # Log error but don't crash
            print(f"MCP SSE error: {e}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@mcp_router.post("/message")
async def handle_message(request: Request):
    """
    Handle POST messages from MCP client.

    This endpoint receives messages from the AI assistant and
    forwards them to the MCP server for processing.
    """
    transport = mcp_server.create_transport()

    # Get message from request body
    message = await request.json()

    # Process message through MCP server
    async with transport.connect_sse(
        request.scope,
        request.receive,
        request._send
    ) as streams:
        await streams[1].send(message)
        response = await streams[0].receive()
        return response
