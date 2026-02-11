"""
Authentication API endpoints for login and registration
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from ..models.user import User
from ..models.base import SessionDep
from ..auth.utils import create_token, hash_password, verify_password
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


@router.post("/register", response_model=AuthResponse)
async def register(
    request: RegisterRequest,
    session: AsyncSession = SessionDep
):
    """Register a new user"""
    # Check if user already exists
    result = await session.execute(
        select(User).where(User.email == request.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user = User(
        id=str(uuid4()),
        email=request.email,
        name=request.name,
        password_hash=hash_password(request.password),
        created_at=datetime.utcnow()
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)

    # Generate token
    token = create_token(user.id)

    return AuthResponse(
        token=token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    session: AsyncSession = SessionDep
):
    """Login with email and password"""
    # Find user by email
    result = await session.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate token
    token = create_token(user.id)

    return AuthResponse(
        token=token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    )


@router.post("/sign-in/email", response_model=AuthResponse)
async def sign_in_email(
    request: LoginRequest,
    session: AsyncSession = SessionDep
):
    """Better Auth compatible login endpoint"""
    return await login(request, session)


@router.get("/session")
async def get_session():
    """Session endpoint for Better Auth compatibility"""
    return {"session": None, "user": None}
