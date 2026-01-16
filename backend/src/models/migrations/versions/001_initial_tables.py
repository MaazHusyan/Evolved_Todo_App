"""
Initial tables for users and tasks
"""
from alembic import op
import sqlalchemy as sa
import uuid

# Revision identifiers
revision = '001_initial_tables'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create users table
    op.create_table(
        'user',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('username', sa.String(50), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('is_active', sa.Boolean, server_default=sa.true(), nullable=False),
    )

    # Create tasks table
    op.create_table(
        'task',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', sa.Uuid(as_uuid=True), sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('is_completed', sa.Boolean, server_default=sa.false(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('priority', sa.String(20), nullable=True),
    )

    # Create indexes
    op.create_index('idx_tasks_user_id', 'task', ['user_id'])
    op.create_index('idx_tasks_completed', 'task', ['is_completed'])
    op.create_index('idx_tasks_due_date', 'task', ['due_date'])
    op.create_index('idx_users_email', 'user', ['email'])
    op.create_index('idx_users_username', 'user', ['username'])


def downgrade():
    # Drop indexes first
    op.drop_index('idx_users_username')
    op.drop_index('idx_users_email')
    op.drop_index('idx_tasks_due_date')
    op.drop_index('idx_tasks_completed')
    op.drop_index('idx_tasks_user_id')

    # Drop tables
    op.drop_table('task')
    op.drop_table('user')