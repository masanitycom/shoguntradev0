
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT NOT NULL,
  user_id TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  usdt_address TEXT,
  wallet_type TEXT CHECK (wallet_type IN ('TRC20', 'ERC20', 'BEP20', 'EVOカード', 'その他')),
  referrer_id TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  total_investment DECIMAL(15,2) DEFAULT 0,
  mlm_level INTEGER DEFAULT 1,
  direct_referrals INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  weekly_earnings DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nft_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_usdt DECIMAL(15,2) NOT NULL,
  daily_return_rate DECIMAL(5,4) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('regular', 'special')),
  image_url TEXT,
  is_special BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_nfts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nft_type_id INTEGER REFERENCES nft_types(id) ON DELETE CASCADE,
  purchase_price DECIMAL(15,2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_delivered BOOLEAN DEFAULT false,
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mlm_levels (
  id SERIAL PRIMARY KEY,
  level INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_japanese TEXT NOT NULL,
  min_investment DECIMAL(15,2) NOT NULL,
  min_direct_referrals INTEGER NOT NULL,
  bonus_percentage DECIMAL(5,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_tree (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  nft_rewards DECIMAL(15,2) DEFAULT 0,
  referral_bonus DECIMAL(15,2) DEFAULT 0,
  total_reward DECIMAL(15,2) DEFAULT 0,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS airdrop_tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  reward_amount DECIMAL(15,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_task_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id INTEGER REFERENCES airdrop_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, task_id)
);

INSERT INTO mlm_levels (level, name, name_japanese, min_investment, min_direct_referrals, bonus_percentage) VALUES
(1, 'Ashigaru', '足軽', 0, 0, 0.02),
(2, 'Samurai', '侍', 1000, 3, 0.05),
(3, 'Bushi', '武士', 5000, 5, 0.08),
(4, 'Hatamoto', '旗本', 10000, 8, 0.12),
(5, 'Daimyo', '大名', 25000, 12, 0.18),
(6, 'Shogun Regent', '将軍摂政', 50000, 20, 0.25),
(7, 'Shogun General', '将軍大将', 100000, 35, 0.35),
(8, 'Shogun', '将軍', 200000, 50, 0.45)
ON CONFLICT (level) DO NOTHING;

INSERT INTO nft_types (name, description, price_usdt, daily_return_rate, category, is_special) VALUES
('SHOGUN NFT 300', '300 USDT投資NFT - 日利0.5%', 300, 0.005, 'regular', false),
('SHOGUN NFT 500', '500 USDT投資NFT - 日利0.6%', 500, 0.006, 'regular', false),
('SHOGUN NFT 1000', '1000 USDT投資NFT - 日利0.7%', 1000, 0.007, 'regular', false),
('SHOGUN NFT 3000', '3000 USDT投資NFT - 日利0.8%', 3000, 0.008, 'regular', false),
('SHOGUN NFT 5000', '5000 USDT投資NFT - 日利0.9%', 5000, 0.009, 'regular', false),
('SHOGUN NFT 10000', '10000 USDT投資NFT - 日利1.0%', 10000, 0.010, 'regular', false),
('SHOGUN NFT 50000', '50000 USDT投資NFT - 日利1.5%', 50000, 0.015, 'regular', false),
('SHOGUN NFT 100000', '100000 USDT投資NFT - 日利2.0%', 100000, 0.020, 'regular', false)
ON CONFLICT (name) DO NOTHING;

INSERT INTO nft_types (name, description, price_usdt, daily_return_rate, category, is_special) VALUES
('限定侍NFT 300', '限定侍NFT - 300 USDT', 300, 0.006, 'special', true),
('限定侍NFT 500', '限定侍NFT - 500 USDT', 500, 0.007, 'special', true),
('限定侍NFT 1000', '限定侍NFT - 1000 USDT', 1000, 0.008, 'special', true),
('限定武士NFT 3000', '限定武士NFT - 3000 USDT', 3000, 0.009, 'special', true),
('限定武士NFT 5000', '限定武士NFT - 5000 USDT', 5000, 0.010, 'special', true),
('限定武士NFT 10000', '限定武士NFT - 10000 USDT', 10000, 0.012, 'special', true),
('限定旗本NFT 15000', '限定旗本NFT - 15000 USDT', 15000, 0.013, 'special', true),
('限定旗本NFT 20000', '限定旗本NFT - 20000 USDT', 20000, 0.014, 'special', true),
('限定旗本NFT 25000', '限定旗本NFT - 25000 USDT', 25000, 0.015, 'special', true),
('限定大名NFT 30000', '限定大名NFT - 30000 USDT', 30000, 0.016, 'special', true),
('限定大名NFT 40000', '限定大名NFT - 40000 USDT', 40000, 0.017, 'special', true),
('限定大名NFT 50000', '限定大名NFT - 50000 USDT', 50000, 0.018, 'special', true),
('限定将軍摂政NFT 60000', '限定将軍摂政NFT - 60000 USDT', 60000, 0.019, 'special', true),
('限定将軍摂政NFT 70000', '限定将軍摂政NFT - 70000 USDT', 70000, 0.020, 'special', true),
('限定将軍大将NFT 80000', '限定将軍大将NFT - 80000 USDT', 80000, 0.021, 'special', true),
('限定将軍大将NFT 90000', '限定将軍大将NFT - 90000 USDT', 90000, 0.022, 'special', true),
('限定将軍NFT 100000', '限定将軍NFT - 100000 USDT', 100000, 0.023, 'special', true),
('限定将軍NFT 200000', '限定将軍NFT - 200000 USDT', 200000, 0.025, 'special', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO airdrop_tasks (name, description, reward_amount) VALUES
('SNS投稿タスク', 'SHOGUN TRADEについてSNSで投稿', 10),
('友達紹介タスク', '3人の友達を紹介', 50),
('初回NFT購入', '初回NFT購入完了', 25),
('週間ログイン', '7日連続ログイン', 15)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referrer_id ON profiles(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_user_id ON user_nfts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_nft_type_id ON user_nfts(nft_type_id);
CREATE INDEX IF NOT EXISTS idx_referral_tree_user_id ON referral_tree(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_tree_referrer_id ON referral_tree(referrer_id);
CREATE INDEX IF NOT EXISTS idx_weekly_rewards_user_id ON weekly_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_rewards_week_start ON weekly_rewards(week_start);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage all profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own NFTs" ON user_nfts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all NFTs" ON user_nfts FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own referral tree" ON referral_tree FOR SELECT USING (auth.uid() = user_id OR auth.uid() = referrer_id);
CREATE POLICY "Service role can manage referral tree" ON referral_tree FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own rewards" ON weekly_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all rewards" ON weekly_rewards FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own task completions" ON user_task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own task completions" ON user_task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage all task completions" ON user_task_completions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read access to NFT types" ON nft_types FOR SELECT USING (true);
CREATE POLICY "Public read access to MLM levels" ON mlm_levels FOR SELECT USING (true);
CREATE POLICY "Public read access to airdrop tasks" ON airdrop_tasks FOR SELECT USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
