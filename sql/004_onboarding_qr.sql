-- 004_onboarding_qr.sql
-- Schema for onboarding and QR reward system

-- Sellers table (if not exists)
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  product_category TEXT,
  product_description TEXT,
  branding_agreement BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QR Events table - logs all QR scan events
CREATE TABLE IF NOT EXISTS qr_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code TEXT NOT NULL,
  user_id TEXT, -- Can be null for anonymous scans
  event_type TEXT NOT NULL CHECK (event_type IN ('scan', 'redeem')),
  points_awarded INTEGER DEFAULT 0,
  metadata JSONB, -- Additional data about the event
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Rewards table - tracks accumulated rewards per user/QR combination
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  qr_code TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  first_scan_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, qr_code) -- Prevent duplicate rewards for same QR
);

-- Products table (for marketplace)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_events_qr_code ON qr_events(qr_code);
CREATE INDEX IF NOT EXISTS idx_qr_events_user_id ON qr_events(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_events_created_at ON qr_events(created_at);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_qr_code ON user_rewards(qr_code);

CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- RLS (Row Level Security) policies
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved sellers
CREATE POLICY "Allow read access to approved sellers" ON sellers
  FOR SELECT USING (status = 'approved');

-- Allow public insert for seller applications
CREATE POLICY "Allow public seller applications" ON sellers
  FOR INSERT WITH CHECK (true);

-- Allow public read access to QR events (for analytics)
CREATE POLICY "Allow read access to qr_events" ON qr_events
  FOR SELECT USING (true);

-- Allow public insert for QR events
CREATE POLICY "Allow public qr event logging" ON qr_events
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own rewards
CREATE POLICY "Users can read their own rewards" ON user_rewards
  FOR SELECT USING (true); -- For now, allow all reads

-- Allow public insert/update for user rewards
CREATE POLICY "Allow public reward updates" ON user_rewards
  FOR ALL WITH CHECK (true);

-- Allow public read access to active products
CREATE POLICY "Allow read access to active products" ON products
  FOR SELECT USING (status = 'active');

-- Functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_rewards_updated_at
  BEFORE UPDATE ON user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to get user's total points
CREATE OR REPLACE FUNCTION get_user_total_points(p_user_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(points) FROM user_rewards WHERE user_id = p_user_id),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data (optional, for development)
-- INSERT INTO sellers (name, shop_name, email, product_category, product_description, branding_agreement, status) VALUES
--   ('Alex Johnson', 'Bold Designs Co', 'alex@bolddesigns.co', 'apparel', 'Edgy streetwear with bold graphics', true, 'approved'),
--   ('Sam Rodriguez', 'Rebel Accessories', 'sam@rebel.com', 'accessories', 'Unique jewelry and accessories', true, 'approved'),
--   ('Jordan Kim', 'Care & Chaos', 'jordan@chaos.com', 'self-care', 'Self-care products with attitude', true, 'approved');