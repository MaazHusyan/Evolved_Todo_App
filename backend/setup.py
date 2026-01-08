from setuptools import setup, find_packages

setup(
    name="todo-backend",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=[
        "fastapi>=0.115.0",
        "uvicorn>=0.32.0",
        "sqlmodel>=0.0.24",
        "pydantic>=2.10.0",
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "python-multipart>=0.0.20",
        "alembic>=1.14.0",
        "sqlalchemy>=2.0.36",
        "aiosqlite>=0.20.0",
        "python-dotenv>=1.0.1",
        "httpx>=0.28.0",
        "pyjwt>=2.10.0",
    ],
    extras_require={
        "dev": [
            "pytest>=8.3.0",
            "pytest-asyncio>=0.25.0",
            "pytest-cov>=6.0.0",
            "black>=24.10.0",
            "isort>=5.13.2",
            "mypy>=1.13.0",
            "flake8>=7.1.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "todo-backend=src.main:main",
        ],
    },
)