"""
Logging configuration for the Todo application API
"""
import logging
import sys
from datetime import datetime
import os

def setup_logging():
    """Configure logging for the application"""
    # Get log level from environment, default to INFO
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    # Create logger
    logger = logging.getLogger("todo_app")
    logger.setLevel(getattr(logging, log_level))

    # Prevent duplicate handlers
    if logger.handlers:
        return logger

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level))

    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)

    # Add handler to logger
    logger.addHandler(console_handler)

    return logger

# Global logger instance
logger = setup_logging()

# Convenience functions
def log_info(message: str):
    """Log an info message"""
    logger.info(message)

def log_error(message: str):
    """Log an error message"""
    logger.error(message)

def log_warning(message: str):
    """Log a warning message"""
    logger.warning(message)

def log_debug(message: str):
    """Log a debug message"""
    logger.debug(message)