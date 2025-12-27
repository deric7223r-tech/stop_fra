-- Audit Logs Table
-- Comprehensive audit trail for compliance (GovS-013, ECCTA 2023, GDPR)

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  organisation_id UUID REFERENCES organisations(organisation_id) ON DELETE SET NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  ip_address VARCHAR(45), -- IPv4 or IPv6
  user_agent TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_organisation_id ON audit_logs(organisation_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_success ON audit_logs(success);

-- Composite index for common queries
CREATE INDEX idx_audit_logs_org_date ON audit_logs(organisation_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);

-- JSONB index for details
CREATE INDEX idx_audit_logs_details_gin ON audit_logs USING GIN(details);

-- Partitioning strategy for large-scale deployments (optional)
-- Partition by month to improve query performance
-- CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system operations. Retained for 6 years per UK regulations.';
COMMENT ON COLUMN audit_logs.event_type IS 'Type of event (auth.login, assessment.submitted, etc.)';
COMMENT ON COLUMN audit_logs.severity IS 'Event severity: info, warning, error, critical';
COMMENT ON COLUMN audit_logs.details IS 'Event-specific details stored as JSONB';
COMMENT ON COLUMN audit_logs.created_at IS 'Event timestamp (immutable after insert)';
