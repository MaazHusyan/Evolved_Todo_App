"""
Comprehensive health check endpoints for monitoring and orchestration.

Provides:
- Liveness probe (is the app running?)
- Readiness probe (is the app ready to serve traffic?)
- Detailed health check with dependency status
"""

from typing import Dict, Any, Optional
from datetime import datetime
import asyncio

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import text

from ..core.logging import Logger
from ..models.base import engine

logger = Logger(__name__)
router = APIRouter(prefix="/health", tags=["Health"])


class HealthStatus(BaseModel):
    """Health check response model."""
    status: str
    timestamp: str
    version: str = "3.0.0"
    checks: Dict[str, Any] = {}


class DependencyCheck(BaseModel):
    """Individual dependency health check."""
    status: str  # "healthy", "degraded", "unhealthy"
    response_time_ms: Optional[float] = None
    message: Optional[str] = None


async def check_database() -> DependencyCheck:
    """
    Check database connectivity and performance.

    Returns:
        DependencyCheck with database status
    """
    start_time = asyncio.get_event_loop().time()

    try:
        # Simple query to check database
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))

        response_time = (asyncio.get_event_loop().time() - start_time) * 1000

        if response_time > 1000:  # Slow response
            return DependencyCheck(
                status="degraded",
                response_time_ms=response_time,
                message="Database responding slowly"
            )

        return DependencyCheck(
            status="healthy",
            response_time_ms=response_time,
            message="Database connection successful"
        )

    except Exception as e:
        logger.error("database_health_check_failed", error=str(e))
        return DependencyCheck(
            status="unhealthy",
            message=f"Database connection failed: {str(e)}"
        )


@router.get("/live", status_code=status.HTTP_200_OK)
async def liveness_probe() -> Dict[str, str]:
    """
    Liveness probe for Kubernetes/orchestration.

    Returns 200 if the application is running.
    This should be a simple check that doesn't depend on external services.

    Returns:
        Simple status response
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness_probe() -> JSONResponse:
    """
    Readiness probe for Kubernetes/orchestration.

    Returns 200 if the application is ready to serve traffic.
    Checks critical dependencies (database).

    Returns:
        Status response with dependency checks
    """
    # Check database
    db_check = await check_database()

    # Determine overall readiness
    is_ready = db_check.status in ["healthy", "degraded"]

    response_status = (
        status.HTTP_200_OK if is_ready
        else status.HTTP_503_SERVICE_UNAVAILABLE
    )

    return JSONResponse(
        status_code=response_status,
        content={
            "status": "ready" if is_ready else "not_ready",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {
                "database": db_check.dict()
            }
        }
    )


@router.get("", status_code=status.HTTP_200_OK)
async def health_check() -> JSONResponse:
    """
    Detailed health check endpoint.

    Provides comprehensive health information including:
    - Overall application status
    - Database connectivity
    - Response times
    - Version information

    Returns:
        Detailed health status
    """
    # Check all dependencies
    db_check = await check_database()

    # Determine overall health
    all_checks = [db_check]
    unhealthy_count = sum(1 for check in all_checks if check.status == "unhealthy")
    degraded_count = sum(1 for check in all_checks if check.status == "degraded")

    if unhealthy_count > 0:
        overall_status = "unhealthy"
        response_status = status.HTTP_503_SERVICE_UNAVAILABLE
    elif degraded_count > 0:
        overall_status = "degraded"
        response_status = status.HTTP_200_OK
    else:
        overall_status = "healthy"
        response_status = status.HTTP_200_OK

    health_response = HealthStatus(
        status=overall_status,
        timestamp=datetime.utcnow().isoformat(),
        checks={
            "database": db_check.dict(),
        }
    )

    logger.info(
        "health_check_performed",
        status=overall_status,
        database_status=db_check.status,
    )

    return JSONResponse(
        status_code=response_status,
        content=health_response.dict()
    )


@router.get("/startup", status_code=status.HTTP_200_OK)
async def startup_probe() -> Dict[str, str]:
    """
    Startup probe for Kubernetes.

    Used to know when the application has started.
    Can have a longer timeout than liveness probe.

    Returns:
        Simple status response
    """
    # Check if critical initialization is complete
    db_check = await check_database()

    if db_check.status == "unhealthy":
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "starting",
                "message": "Application is still starting up",
                "timestamp": datetime.utcnow().isoformat()
            }
        )

    return {
        "status": "started",
        "timestamp": datetime.utcnow().isoformat()
    }
