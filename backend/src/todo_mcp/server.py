"""MCP server configuration and initialization."""
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from typing import Optional
import os


class MCPServer:
    """
    MCP server instance for AI tool integration.

    This server provides task management tools to the AI assistant,
    allowing it to create, read, update, and delete tasks on behalf
    of the user.
    """

    def __init__(self):
        """Initialize MCP server with configuration."""
        self.server = Server("evolve-todo-mcp")
        self.transport: Optional[SseServerTransport] = None

        # Configuration from environment
        self.context_window_size = int(
            os.getenv("MCP_CONTEXT_WINDOW_SIZE", "50")
        )

    def get_server(self) -> Server:
        """Get the MCP server instance."""
        return self.server

    def create_transport(self) -> SseServerTransport:
        """
        Create SSE transport for real-time communication.

        Returns:
            SseServerTransport: Configured transport instance
        """
        if not self.transport:
            self.transport = SseServerTransport("/mcp/sse")
        return self.transport


# Global MCP server instance
mcp_server = MCPServer()
