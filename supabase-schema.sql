ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

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
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  nft_type_id INTEGER REFERENCES nft_types(id),
  purchase_price DECIMAL(15,2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  operation_start_date TIMESTAMP WITH TIME ZONE,
  is_delivered BOOLEAN DEFAULT false,
  delivery_date TIMESTAMP WITH TIME ZONE,
  daily_earnings DECIMAL(15,2) DEFAULT 0,
  total_earnings DECIMAL(15,2) DEFAULT 0,
  max_earnings DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_tree (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  referrer_id UUID REFERENCES profiles(id),
  level INTEGER NOT NULL,
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

CREATE TABLE IF NOT EXISTS weekly_rewards (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  base_reward DECIMAL(15,2) DEFAULT 0,
  referral_bonus DECIMAL(15,2) DEFAULT 0,
  total_reward DECIMAL(15,2) DEFAULT 0,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS airdrop_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_amount DECIMAL(15,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_task_completions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  task_id INTEGER REFERENCES airdrop_tasks(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT false,
  UNIQUE(user_id, task_id)
);

INSERT INTO mlm_levels (level, name, name_japanese, min_investment, min_direct_referrals, bonus_percentage) VALUES
(1, 'Ashigaru', '足軽', 1000, 0, 0.45),
(2, 'Busho', '武将', 1000, 0, 0.25),
(3, 'Daimyo', '代官', 1000, 0, 0.10),
(4, 'Bugyo', '奉行', 1000, 0, 0.06),
(5, 'Rochu', '老中', 1000, 0, 0.05),
(6, 'Tairo', '大老', 1000, 0, 0.04),
(7, 'Taimei', '大名', 1000, 0, 0.03),
(8, 'Shogun', '将軍', 1000, 0, 0.02);

INSERT INTO nft_types (name, description, price_usdt, daily_return_rate, category, image_url, is_special) VALUES
('SHOGUN NFT 300', 'SHOGUN NFT 300 USDT', 300, 0.005, 'regular', '/images/nft/shogun-300.png', false),
('SHOGUN NFT 500', 'SHOGUN NFT 500 USDT', 500, 0.005, 'regular', '/images/nft/shogun-500.png', false),
('SHOGUN NFT 1,000', 'SHOGUN NFT 1,000 USDT', 1000, 0.010, 'regular', '/images/nft/shogun-1000.png', false),
('SHOGUN NFT 3,000', 'SHOGUN NFT 3,000 USDT', 3000, 0.010, 'regular', '/images/nft/shogun-3000.png', false),
('SHOGUN NFT 5,000', 'SHOGUN NFT 5,000 USDT', 5000, 0.010, 'regular', '/images/nft/shogun-5000.png', false),
('SHOGUN NFT 10,000', 'SHOGUN NFT 10,000 USDT', 10000, 0.0125, 'regular', '/images/nft/shogun-10000.png', false),
('SHOGUN NFT 30,000', 'SHOGUN NFT 30,000 USDT', 30000, 0.015, 'regular', '/images/nft/shogun-30000.png', false),
('SHOGUN NFT 100,000', 'SHOGUN NFT 100,000 USDT', 100000, 0.020, 'regular', '/images/nft/shogun-100000.png', false);

INSERT INTO nft_types (name, description, price_usdt, daily_return_rate, category, image_url, is_special) VALUES
('SHOGUN NFT 100', 'SHOGUN NFT 100 USDT (Special)', 100, 0.005, 'special', '/images/nft/shogun-100.png', true),
('SHOGUN NFT 200', 'SHOGUN NFT 200 USDT (Special)', 200, 0.005, 'special', '/images/nft/shogun-200.png', true),
('SHOGUN NFT 600', 'SHOGUN NFT 600 USDT (Special)', 600, 0.005, 'special', '/images/nft/shogun-600.png', true),
('SHOGUN NFT 1,100', 'SHOGUN NFT 1,100 USDT (Special)', 1100, 0.010, 'special', '/images/nft/shogun-1100.png', true),
('SHOGUN NFT 1,177', 'SHOGUN NFT 1,177 USDT (Special)', 1177, 0.010, 'special', '/images/nft/shogun-1177.png', true),
('SHOGUN NFT 1,217', 'SHOGUN NFT 1,217 USDT (Special)', 1217, 0.010, 'special', '/images/nft/shogun-1217.png', true),
('SHOGUN NFT 1,227', 'SHOGUN NFT 1,227 USDT (Special)', 1227, 0.010, 'special', '/images/nft/shogun-1227.png', true),
('SHOGUN NFT 1,300', 'SHOGUN NFT 1,300 USDT (Special)', 1300, 0.010, 'special', '/images/nft/shogun-1300.png', true),
('SHOGUN NFT 1,350', 'SHOGUN NFT 1,350 USDT (Special)', 1350, 0.010, 'special', '/images/nft/shogun-1350.png', true),
('SHOGUN NFT 1,500', 'SHOGUN NFT 1,500 USDT (Special)', 1500, 0.010, 'special', '/images/nft/shogun-1500.png', true),
('SHOGUN NFT 1,600', 'SHOGUN NFT 1,600 USDT (Special)', 1600, 0.010, 'special', '/images/nft/shogun-1600.png', true),
('SHOGUN NFT 1,836', 'SHOGUN NFT 1,836 USDT (Special)', 1836, 0.010, 'special', '/images/nft/shogun-1836.png', true),
('SHOGUN NFT 2,000', 'SHOGUN NFT 2,000 USDT (Special)', 2000, 0.010, 'special', '/images/nft/shogun-2000.png', true),
('SHOGUN NFT 2,100', 'SHOGUN NFT 2,100 USDT (Special)', 2100, 0.010, 'special', '/images/nft/shogun-2100.png', true),
('SHOGUN NFT 3,175', 'SHOGUN NFT 3,175 USDT (Special)', 3175, 0.010, 'special', '/images/nft/shogun-3175.png', true),
('SHOGUN NFT 4,000', 'SHOGUN NFT 4,000 USDT (Special)', 4000, 0.010, 'special', '/images/nft/shogun-4000.png', true),
('SHOGUN NFT 6,600', 'SHOGUN NFT 6,600 USDT (Special)', 6600, 0.010, 'special', '/images/nft/shogun-6600.png', true),
('SHOGUN NFT 8,000', 'SHOGUN NFT 8,000 USDT (Special)', 8000, 0.010, 'special', '/images/nft/shogun-8000.png', true);

INSERT INTO airdrop_tasks (title, description, reward_amount) VALUES
('SNSシェア', 'SHOGUN TRADEをSNSでシェアする', 10),
('友達紹介', '新しいユーザーを紹介する', 50),
('デイリーログイン', '7日連続ログインする', 25),
('NFT購入', '初回NFT購入を完了する', 100);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own NFTs" ON user_nfts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own NFTs" ON user_nfts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own referral tree" ON referral_tree FOR SELECT USING (auth.uid() = user_id OR auth.uid() = referrer_id);

CREATE POLICY "Users can view own rewards" ON weekly_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own rewards" ON weekly_rewards FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own task completions" ON user_task_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own task completions" ON user_task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
