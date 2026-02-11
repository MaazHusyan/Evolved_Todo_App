"""Groq client configuration for chat completions using OpenAI SDK compatibility."""

from openai import AsyncOpenAI
import os
import asyncio
from typing import Optional


class GroqClient:
    """
    Groq client wrapper for chat completions using OpenAI SDK.

    Groq provides extremely fast inference (~280 tokens/sec) with excellent
    tool calling support. The free tier has generous rate limits:
    - Rate limits: ~1K-14K requests per day depending on traffic
    - Context window: 128K for most models
    - No credit card required

    Default model: llama-3.3-70b-versatile (excellent for tool calling)
    Alternative: llama-3.1-8b-instant (faster, lighter)
    """

    def __init__(self):
        """Initialize Groq client with configuration."""
        self._client: Optional[AsyncOpenAI] = None
        self._api_key = os.getenv("GROQ_API_KEY")
        # Groq model - llama-3.3-70b-versatile has excellent tool calling
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.context_window_size = int(os.getenv("MCP_CONTEXT_WINDOW_SIZE", "50"))
        self.max_retries = int(os.getenv("AI_MAX_RETRIES", "3"))
        self.retry_delay = float(os.getenv("AI_RETRY_DELAY", "1.0"))

    def get_client(self) -> AsyncOpenAI:
        """Get the Groq client instance. Initializes on first use."""
        if not self._api_key:
            # Fall back to OpenRouter if no Groq API key
            openrouter_key = os.getenv("OPENROUTER_API_KEY")
            if not openrouter_key:
                raise ValueError(
                    "GROQ_API_KEY not configured. Please add your Groq API key to the .env file. "
                    "Get a free key at: https://console.groq.com/keys"
                )
            # Use OpenRouter as fallback
            if self._client is None:
                self._client = AsyncOpenAI(
                    api_key=openrouter_key,
                    base_url="https://openrouter.ai/api/v1",
                )
            return self._client

        if self._client is None:
            self._client = AsyncOpenAI(
                api_key=self._api_key,
                base_url="https://api.groq.com/openai/v1",
            )

        return self._client

    def get_model(self) -> str:
        """Get the configured model name."""
        return self.model

    def get_context_window_size(self) -> int:
        """Get the context window size for message history."""
        return self.context_window_size

    def is_configured(self) -> bool:
        """Check if Groq API key is configured."""
        return bool(self._api_key)

    async def create_completion_with_retry(self, **kwargs):
        """
        Create a chat completion with exponential backoff retry logic.

        This handles rate limits gracefully by retrying with increasing delays.
        """
        client = self.get_client()
        last_error = None

        for attempt in range(self.max_retries):
            try:
                response = await asyncio.wait_for(
                    client.chat.completions.create(**kwargs),
                    timeout=60.0,  # 60 second timeout
                )
                return response
            except asyncio.TimeoutError:
                last_error = TimeoutError(
                    f"Request timed out after 60s (attempt {attempt + 1})"
                )
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (2**attempt))
            except Exception as e:
                error_str = str(e).lower()
                # Check if it's a rate limit error
                if "rate limit" in error_str or "429" in error_str:
                    last_error = RateLimitError(f"Rate limited (attempt {attempt + 1})")
                    if attempt < self.max_retries - 1:
                        # Exponential backoff: 1s, 2s, 4s, etc.
                        await asyncio.sleep(self.retry_delay * (2**attempt))
                elif "timeout" in error_str or "timed out" in error_str:
                    last_error = TimeoutError(f"Timeout (attempt {attempt + 1})")
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(self.retry_delay * (2**attempt))
                else:
                    # Other error, don't retry
                    raise

        # All retries exhausted
        raise last_error


class RateLimitError(Exception):
    """Raised when API rate limit is exceeded."""

    pass


class TimeoutError(Exception):
    """Raised when API request times out."""

    pass


# Global Groq client instance
groq_client = GroqClient()
