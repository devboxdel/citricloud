"""
Alembic migration script to create hosting management tables
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'hosting_management_001'
down_revision = 'previous_revision_here'  # Update with your latest migration
branch_labels = None
depends_on = None


def upgrade():
    # Servers table
    op.create_table(
        'hosting_servers',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('plan', sa.String(100), nullable=False),
        sa.Column('os', sa.String(100), nullable=False),
        sa.Column('datacenter', sa.String(100), nullable=False),
        sa.Column('ip', sa.String(45), nullable=True),
        sa.Column('status', sa.String(50), default='provisioning'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_hosting_servers_user_id', 'hosting_servers', ['user_id'])

    # VPN table
    op.create_table(
        'hosting_vpn',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('protocol', sa.String(50), nullable=False),
        sa.Column('location', sa.String(100), nullable=False),
        sa.Column('server_ip', sa.String(45), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_hosting_vpn_user_id', 'hosting_vpn', ['user_id'])

    # Domains table
    op.create_table(
        'hosting_domains',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('auto_renew', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_hosting_domains_user_id', 'hosting_domains', ['user_id'])
    op.create_index('ix_hosting_domains_name', 'hosting_domains', ['name'])

    # DNS Zones table
    op.create_table(
        'hosting_dns_zones',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('domain_id', sa.Integer(), sa.ForeignKey('hosting_domains.id', ondelete='CASCADE'), nullable=False),
        sa.Column('domain', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_hosting_dns_zones_user_id', 'hosting_dns_zones', ['user_id'])

    # DNS Records table
    op.create_table(
        'hosting_dns_records',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('zone_id', sa.Integer(), sa.ForeignKey('hosting_dns_zones.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.String(10), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('ttl', sa.Integer(), default=3600),
        sa.Column('priority', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_hosting_dns_records_zone_id', 'hosting_dns_records', ['zone_id'])

    # Email Accounts table
    op.create_table(
        'hosting_email_accounts',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('quota', sa.Integer(), nullable=False),
        sa.Column('used', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_hosting_email_accounts_user_id', 'hosting_email_accounts', ['user_id'])
    op.create_index('ix_hosting_email_accounts_email', 'hosting_email_accounts', ['email'])

    # WordPress Sites table
    op.create_table(
        'hosting_wordpress_sites',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('domain', sa.String(255), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('admin_email', sa.String(255), nullable=False),
        sa.Column('version', sa.String(50), nullable=False),
        sa.Column('php_version', sa.String(50), nullable=False),
        sa.Column('status', sa.String(50), default='active'),
        sa.Column('plugin_count', sa.Integer(), default=0),
        sa.Column('theme', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_hosting_wordpress_sites_user_id', 'hosting_wordpress_sites', ['user_id'])

    # Control Panels table
    op.create_table(
        'hosting_control_panels',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('server_id', sa.Integer(), sa.ForeignKey('hosting_servers.id', ondelete='CASCADE'), nullable=False),
        sa.Column('panel_type', sa.String(100), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('version', sa.String(50), nullable=False),
        sa.Column('installed_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_hosting_control_panels_user_id', 'hosting_control_panels', ['user_id'])


def downgrade():
    op.drop_table('hosting_control_panels')
    op.drop_table('hosting_wordpress_sites')
    op.drop_table('hosting_email_accounts')
    op.drop_table('hosting_dns_records')
    op.drop_table('hosting_dns_zones')
    op.drop_table('hosting_domains')
    op.drop_table('hosting_vpn')
    op.drop_table('hosting_servers')
