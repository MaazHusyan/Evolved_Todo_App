"""
Add tags column to tasks table
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# Revision identifiers
revision = '002_add_tags_column'
down_revision = '001_initial_tables'
branch_labels = None
depends_on = None

def upgrade():
    # Add tags column to tasks table
    op.add_column('task', sa.Column('tags', JSON, nullable=True, default='[]'))

def downgrade():
    # Remove tags column from tasks table
    op.drop_column('task', 'tags')
