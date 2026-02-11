"""OpenAI Agents SDK configuration for Gemini API integration.

This module configures the Agents SDK to work with Google's Gemini API
using the OpenAI-compatible interface.
"""

import os
from agents import AsyncOpenAI, OpenAIChatCompletionsModel
from agents.run import RunConfig
from dotenv import load_dotenv

load_dotenv()


class AgentsConfig:
    """Configuration for OpenAI Agents SDK with Gemini."""

    def __init__(self):
        """Initialize Agents SDK configuration."""
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
        self.gemini_base_url = (
            "https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        self.openrouter_model = os.getenv(
            "OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct:free"
        )

        self.mcp_server_url = os.getenv(
            "MCP_SERVER_URL", "http://localhost:8001/api/mcp"
        )
        self.mcp_timeout = int(os.getenv("MCP_TIMEOUT", "30"))

        if self.gemini_api_key:
            self._setup_gemini()
        elif self.openrouter_api_key:
            self._setup_openrouter()
        else:
            raise ValueError(
                "No API key found. Please add GEMINI_API_KEY or OPENROUTER_API_KEY to your .env file."
            )

    def _setup_gemini(self):
        """Set up Gemini API configuration."""
        self.api_key = self.gemini_api_key
        self.base_url = self.gemini_base_url
        self.model_name = self.gemini_model
        self.provider = "gemini"

        self.external_provider = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
        )

        self.model = OpenAIChatCompletionsModel(
            openai_client=self.external_provider,
            model=self.model_name,
        )

        self.config = RunConfig(
            model=self.model,
            model_provider=self.external_provider,
            tracing_disabled=True,
        )
        print(f"✓ Using Gemini model: {self.model_name}")

    def _setup_openrouter(self):
        """Set up OpenRouter as fallback."""
        self.api_key = self.openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.model_name = self.openrouter_model
        self.provider = "openrouter"

        self.external_provider = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
        )

        self.model = OpenAIChatCompletionsModel(
            openai_client=self.external_provider,
            model=self.model_name,
        )

        self.config = RunConfig(
            model=self.model,
            model_provider=self.external_provider,
            tracing_disabled=True,
        )
        print(f"✓ Using OpenRouter model: {self.model_name}")

    def get_config(self) -> RunConfig:
        """Get the RunConfig for agent execution."""
        return self.config

    def get_model(self) -> OpenAIChatCompletionsModel:
        """Get the configured model."""
        return self.model

    def get_provider(self) -> AsyncOpenAI:
        """Get the external provider client."""
        return self.external_provider

    def get_provider_name(self) -> str:
        """Get the provider name."""
        return self.provider


agents_config = AgentsConfig()
