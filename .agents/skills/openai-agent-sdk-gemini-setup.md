# Skill: OpenAI Agent SDK with Gemini API Setup

## Overview

This skill provides a complete guide for setting up OpenAI Agent SDK to work with Google's Gemini API, enabling you to use Gemini models through OpenAI-compatible interfaces.

## Prerequisites

- Python 3.12+
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

## Installation

### 1. Add Dependencies

Add to your `pyproject.toml` or `requirements.txt`:

```toml
[project]
dependencies = [
    "openai-agents>=0.6.4",
    "python-dotenv>=1.2.1",
    # ... other deps
]
```

Or install directly:

```bash
pip install openai-agents>=0.6.4 python-dotenv>=1.2.1
```

### 2. Environment Configuration

Create a `.env` file in your project root:

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: OpenAI fallback (if you want redundancy)
OPENAI_API_KEY=your_openai_api_key_here
```

**Get your Gemini API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Copy and paste into `.env`

## Implementation Approaches

### Approach 1: Simple Setup (Recommended for Quick Start)

Create a `gemini_model.py` file:

```python
import os
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

# Gemini API Configuration
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize client
client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url=GEMINI_BASE_URL,
)

# Create model wrapper
gemini_model = OpenAIChatCompletionsModel(
    openai_client=client,
    model="gemini-2.0-flash-exp",  # or "gemini-2.5-flash"
)

# Create run configuration
config = RunConfig(
    model=gemini_model,
    model_provider=client,
    tracing_disabled=True
)
```

**Usage in your agent:**

```python
from agents import Agent, Runner
from gemini_model import gemini_model, config

agent = Agent(
    name="My Agent",
    instructions="You are a helpful assistant.",
    model=gemini_model,
)

async def main():
    result = await Runner.run(
        agent,
        "Hello, how are you?",
        run_config=config
    )
    print(result.final_output)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### Approach 2: Settings-Based Configuration (Production)

Create `core/config.py`:

```python
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    """Application settings with LLM provider selection."""
    
    def __init__(self):
        # Select provider: "groq" or "gemini"
        self.LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
        
        # Gemini Configuration
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
        self.GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
        self.GEMINI_MODEL = "gemini-2.0-flash-exp"
        
        # Active settings based on provider
        self.LLM_API_KEY = self.GEMINI_API_KEY
        self.LLM_BASE_URL = self.GEMINI_BASE_URL
        self.LLM_MODEL = self.GEMINI_MODEL
    
    def validate(self) -> bool:
        """Validate required API keys."""
        if not self.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required")
        return True


# Global instance
settings = Settings()
```

Create `services/ai_service.py`:

```python
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
from core.config import settings


class AIService:
    """Service for AI interactions using OpenAI Agent SDK."""
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.LLM_API_KEY,
            base_url=settings.LLM_BASE_URL
        )
        self.model = OpenAIChatCompletionsModel(
            openai_client=self.client,
            model=settings.LLM_MODEL
        )
        self.config = RunConfig(
            model=self.model,
            model_provider=self.client
        )
        print(f"✓ Using LLM: {settings.LLM_MODEL}")
    
    async def generate_response(self, query: str) -> str:
        """Generate a response using the configured model."""
        messages = [
            {"role": "user", "content": query}
        ]
        
        response = await self.client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=messages,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    async def generate_stream(self, query: str):
        """Generate a streaming response."""
        messages = [{"role": "user", "content": query}]
        
        stream = await self.client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=messages,
            temperature=0.7,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


# Global instance
ai_service = AIService()
```

### Approach 3: Multi-Provider with Fallback

For redundancy with automatic fallback:

```python
import os
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
from dotenv import load_dotenv

load_dotenv()

# Configuration
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
MODEL_AVAILABLE = False
client = None
model = None
config = None

# Try Gemini first
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    try:
        client = AsyncOpenAI(
            api_key=gemini_api_key,
            base_url=GEMINI_BASE_URL,
        )
        model = OpenAIChatCompletionsModel(
            openai_client=client,
            model="gemini-2.0-flash-exp",
        )
        MODEL_AVAILABLE = True
    except Exception as e:
        print(f"Gemini API unavailable: {e}")

# Fallback to OpenAI
if not MODEL_AVAILABLE:
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        try:
            client = AsyncOpenAI(api_key=openai_api_key)
            model = OpenAIChatCompletionsModel(
                openai_client=client,
                model="gpt-3.5-turbo",
            )
            MODEL_AVAILABLE = True
        except Exception as e:
            print(f"OpenAI API unavailable: {e}")

# Create config if model is available
if MODEL_AVAILABLE:
    config = RunConfig(
        model=model,
        model_provider=client,
        tracing_disabled=True
    )
else:
    raise RuntimeError("No LLM provider available")
```

## Available Gemini Models

| Model | Description | Best For |
|-------|-------------|----------|
| `gemini-2.0-flash-exp` | Latest fast model | General tasks, quick responses |
| `gemini-2.5-flash` | Balanced model | Complex reasoning, chat |
| `gemini-1.5-flash` | Previous generation | Cost-effective, fast |
| `gemini-1.5-pro` | High quality | Complex tasks, coding |

## Advanced Features

### Streaming Responses

```python
async def stream_response(query: str):
    messages = [{"role": "user", "content": query}]
    
    stream = await client.chat.completions.create(
        model="gemini-2.0-flash-exp",
        messages=messages,
        stream=True
    )
    
    async for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            print(content, end="", flush=True)
```

### With Retry Logic

```python
import asyncio

async def generate_with_retry(query: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            response = await client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=[{"role": "user", "content": query}],
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                delay = 2 ** attempt
                print(f"Rate limit. Retrying in {delay}s...")
                await asyncio.sleep(delay)
            else:
                raise
    raise Exception(f"Failed after {max_retries} attempts")
```

### Using with Agents Framework

```python
from agents import Agent, Runner, function_tool

@function_tool
def get_weather(city: str) -> str:
    return f"The weather in {city} is sunny!"

agent = Agent(
    name="Weather Agent",
    instructions="You are a weather assistant.",
    model=gemini_model,
    tools=[get_weather]
)

result = await Runner.run(
    agent,
    "What's the weather in Paris?",
    run_config=config
)
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Gemini API key |
| `OPENAI_API_KEY` | No | Fallback OpenAI key (optional) |
| `LLM_PROVIDER` | No | Provider selection: "gemini" or "groq" |

## Troubleshooting

### Issue: "API key not found"
- Ensure `.env` file exists in project root
- Check that `python-dotenv` is installed
- Verify the env var name matches exactly

### Issue: "ModuleNotFoundError: No module named 'agents'"
- Run: `pip install openai-agents>=0.6.4`
- Verify installation: `pip list | grep openai-agents`

### Issue: "Quota exceeded" or "429 Rate limit"
- Implement retry logic with exponential backoff
- Consider using multiple API keys
- Check your Gemini API quota in Google AI Studio

### Issue: "Invalid model name"
- Verify model name is correct (e.g., `gemini-2.0-flash-exp` not `gemini-flash`)
- Check available models in Google AI Studio

## Project Structure

```
project/
├── .env                     # Environment variables
├── pyproject.toml          # Dependencies
├── core/
│   └── config.py          # Settings configuration
├── services/
│   └── ai_service.py      # AI service class
└── agents/
    └── gemini_model.py    # Simple setup (optional)
```

## Quick Start Checklist

- [ ] Install dependencies: `openai-agents>=0.6.4`, `python-dotenv>=1.2.1`
- [ ] Create `.env` file with `GEMINI_API_KEY`
- [ ] Create configuration module
- [ ] Create AI service class
- [ ] Test with simple agent
- [ ] Implement error handling and retries
- [ ] Add streaming support (optional)

## Key Files from This Project

- **Configuration**: `server/app/core/config.py`
- **AI Service**: `server/app/services/ai_service.py`
- **Simple Example**: `References/gemini_model.py`
- **Agent Example**: `References/00_simple_agent.py`

## References

- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com/)
