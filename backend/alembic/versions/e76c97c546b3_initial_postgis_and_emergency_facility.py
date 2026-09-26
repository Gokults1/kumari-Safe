"""initial_postgis_and_emergency_facility

Revision ID: e76c97c546b3
Revises: 
Create Date: 2026-09-25 13:37:57.853783

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = 'e76c97c546b3'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Ensure postgis extension exists
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis;')
    
    op.create_table('emergency_facilities',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('facility_type', sa.Enum('POLICE', 'HOSPITAL', 'FIRE_STATION', 'DISASTER_CONTROL_ROOM', 'OTHER_EMERGENCY', name='facilitytype'), nullable=False),
    # Note: geoalchemy2 adds columns differently, but Alembic can generate it this way:
    sa.Column('geom', geoalchemy2.types.Geometry(geometry_type='POINT', srid=4326, spatial_index=False, from_text='ST_GeomFromEWKT', name='geometry'), nullable=False),
    sa.Column('phone', sa.String(), nullable=True),
    sa.Column('address', sa.Text(), nullable=True),
    sa.Column('source', sa.String(), nullable=False),
    sa.Column('source_url', sa.String(), nullable=True),
    sa.Column('last_verified', sa.DateTime(), nullable=False),
    sa.Column('data_type', sa.Enum('OFFICIAL', 'OPEN_DATA', 'THIRD_PARTY_API', 'CALCULATED', 'USER_REPORTED', 'ESTIMATED', name='datasourcetype'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_emergency_facilities_facility_type'), 'emergency_facilities', ['facility_type'], unique=False)
    op.create_index(op.f('ix_emergency_facilities_id'), 'emergency_facilities', ['id'], unique=False)
    op.create_index('idx_emergency_facilities_geom', 'emergency_facilities', ['geom'], unique=False, postgresql_using='gist')


def downgrade() -> None:
    op.drop_index('idx_emergency_facilities_geom', table_name='emergency_facilities', postgresql_using='gist')
    op.drop_index(op.f('ix_emergency_facilities_id'), table_name='emergency_facilities')
    op.drop_index(op.f('ix_emergency_facilities_facility_type'), table_name='emergency_facilities')
    op.drop_table('emergency_facilities')
    sa.Enum(name='datasourcetype').drop(op.get_bind(), checkfirst=False)
    sa.Enum(name='facilitytype').drop(op.get_bind(), checkfirst=False)
