"""add design spec columns

Revision ID: 0bb45ff3f0b9
Revises: d50118650e0c
Create Date: 2026-09-08 15:17:31.899485

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0bb45ff3f0b9'
down_revision: Union[str, None] = 'd50118650e0c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'designs', sa.Column('spec', sa.JSON(), nullable=True)
    )
    op.add_column(
        'designs',
        sa.Column('analyzed_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('designs', 'analyzed_at')
    op.drop_column('designs', 'spec')
