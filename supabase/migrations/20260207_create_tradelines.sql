-- Create tradelines table (inventory management)
CREATE TABLE IF NOT EXISTS tradelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id VARCHAR(20) NOT NULL UNIQUE,
  bank_name VARCHAR(50) NOT NULL,
  credit_limit DECIMAL(10, 2) NOT NULL,
  account_age_years INT NOT NULL,
  account_age_months INT NOT NULL,
  purchase_deadline DATE NOT NULL,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  price DECIMAL(8, 2) NOT NULL,
  stock_count INT NOT NULL DEFAULT 1,
  guarantees JSONB DEFAULT '{
    "no_late_payments": true,
    "utilization_percent": 15,
    "guaranteed_post_date": null
  }',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tradeline orders table
CREATE TABLE IF NOT EXISTS tradeline_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tradeline_id UUID NOT NULL REFERENCES tradelines(id) ON DELETE RESTRICT,
  quantity INT DEFAULT 1,
  price DECIMAL(8, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, payment_processing, completed, failed
  payment_method VARCHAR(50), -- e-check, stripe, etc
  order_number VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create signed agreements table
CREATE TABLE IF NOT EXISTS signed_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES tradeline_orders(id) ON DELETE SET NULL,
  agreement_type VARCHAR(100) DEFAULT 'broker_agreement', -- broker_agreement, disclosure, etc
  signature_data TEXT NOT NULL, -- Base64 encoded signature image or DocuSign envelope ID
  signature_date TIMESTAMP DEFAULT NOW(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  ip_address INET,
  user_agent TEXT,
  is_valid BOOLEAN DEFAULT true,
  pdf_url VARCHAR(500), -- URL to signed PDF stored in storage
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create document uploads table (for compliance)
CREATE TABLE IF NOT EXISTS document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES tradeline_orders(id) ON DELETE SET NULL,
  document_type VARCHAR(100), -- drivers_license, ssn_card, billing_license
  file_path VARCHAR(500) NOT NULL, -- Path in Supabase storage
  file_name VARCHAR(255),
  file_size INT,
  mime_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  verified_by VARCHAR(255) -- Admin or system that verified
);

-- Create indexes for common queries
CREATE INDEX idx_tradelines_card_id ON tradelines(card_id);
CREATE INDEX idx_tradelines_active ON tradelines(is_active);
CREATE INDEX idx_tradeline_orders_user ON tradeline_orders(user_id);
CREATE INDEX idx_tradeline_orders_status ON tradeline_orders(status);
CREATE INDEX idx_signed_agreements_user ON signed_agreements(user_id);
CREATE INDEX idx_signed_agreements_order ON signed_agreements(order_id);
CREATE INDEX idx_document_uploads_user ON document_uploads(user_id);
CREATE INDEX idx_document_uploads_order ON document_uploads(order_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tradelines_updated_at BEFORE UPDATE ON tradelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tradeline_orders_updated_at BEFORE UPDATE ON tradeline_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE tradelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradeline_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Tradelines: Everyone can read, only admin can write
CREATE POLICY "Tradelines are viewable by everyone" ON tradelines
  FOR SELECT USING (is_active = true);

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view their own orders" ON tradeline_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON tradeline_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Agreements: Users can only see their own
CREATE POLICY "Users can view their own agreements" ON signed_agreements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agreements" ON signed_agreements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Documents: Users can only see their own
CREATE POLICY "Users can view their own documents" ON document_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents" ON document_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
