"""Add chat tables for AI chatbot feature

Revision ID: 003_add_chat_tables
Revises: 002_add_tags_column
Create Date: 2026-02-08

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = "003_add_chat_tables"
down_revision = "002_add_tags_column"
branch_labels = None
depends_on = None


def upgrade():
    # Create conversations table
    op.create_table(
        "conversations",
        sa.Column("id", sa.VARCHAR(36), primary_key=True, default=uuid.uuid4),
        sa.Column("user_id", sa.VARCHAR(36), nullable=False),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()")
        ),
        sa.Column(
            "updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()")
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )

    # Create index on user_id for fast user lookup
    op.create_index("idx_conversations_user_id", "conversations", ["user_id"])

    # Create messages table
    op.create_table(
        "messages",
        sa.Column("id", sa.VARCHAR(36), primary_key=True, default=uuid.uuid4),
        sa.Column("conversation_id", sa.VARCHAR(36), nullable=False),
        sa.Column("role", sa.VARCHAR(20), nullable=False),
        sa.Column("content", sa.TEXT, nullable=False),
        sa.Column("tool_calls", sa.JSON, nullable=True),
        sa.Column(
            "created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()")
        ),
        sa.ForeignKeyConstraint(
            ["conversation_id"], ["conversations.id"], ondelete="CASCADE"
        ),
        sa.CheckConstraint("role IN ('user', 'assistant')", name="check_message_role"),
    )

    # Create indexes for efficient querying
    op.create_index("idx_messages_conversation_id", "messages", ["conversation_id"])
    op.create_index("idx_messages_created_at", "messages", ["created_at"])


def downgrade():
    # Drop tables in reverse order
    op.drop_index("idx_messages_created_at", table_name="messages")
    op.drop_index("idx_messages_conversation_id", table_name="messages")
    op.drop_table("messages")

    op.drop_index("idx_conversations_user_id", table_name="conversations")
    op.drop_table("conversations")
