
DROP TABLE IF EXISTS user_task_completions CASCADE;
DROP TABLE IF EXISTS airdrop_tasks CASCADE;
DROP TABLE IF EXISTS weekly_rewards CASCADE;
DROP TABLE IF EXISTS referral_tree CASCADE;
DROP TABLE IF EXISTS user_nfts CASCADE;
DROP TABLE IF EXISTS nft_types CASCADE;
DROP TABLE IF EXISTS mlm_levels CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_kana TEXT,
  user_id TEXT UNIQUE NOT NULL,
  phone TEXT,
  referrer_id TEXT,
  usdt_address TEXT,
  wallet_type TEXT DEFAULT 'その他',
  role TEXT DEFAULT 'user',
  current_level INTEGER DEFAULT 1,
  total_investment DECIMAL(15,2) DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  direct_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mlm_levels (
  id SERIAL PRIMARY KEY,
  level INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_japanese TEXT NOT NULL,
  min_investment DECIMAL(15,2) NOT NULL,
  min_direct_referrals INTEGER NOT NULL,
  bonus_percentage DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nft_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_usdt DECIMAL(15,2) NOT NULL,
  daily_return_rate DECIMAL(5,4) NOT NULL,
  category TEXT DEFAULT 'regular',
  is_special BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_nfts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nft_type_id INTEGER REFERENCES nft_types(id) NOT NULL,
  purchase_price DECIMAL(15,2) NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_earned DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  is_delivered BOOLEAN DEFAULT FALSE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE referral_tree (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  referrer_id UUID REFERENCES auth.users(id),
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE weekly_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  week_start DATE NOT NULL,
  nft_rewards DECIMAL(15,2) DEFAULT 0,
  referral_rewards DECIMAL(15,2) DEFAULT 0,
  total_rewards DECIMAL(15,2) DEFAULT 0,
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE airdrop_tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  question TEXT NOT NULL,
  choices JSONB NOT NULL,
  reward_amount DECIMAL(15,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_task_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  task_id INTEGER REFERENCES airdrop_tasks(id) NOT NULL,
  answer_choice INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_claimed BOOLEAN DEFAULT FALSE
);

INSERT INTO mlm_levels (level, name, name_japanese, min_investment, min_direct_referrals, bonus_percentage) VALUES
(0, 'None', 'レベルなし', 0, 0, 0.00),
(1, 'Ashigaru', '足軽', 1000, 0, 45.00),
(2, 'Busho', '武将', 3000, 0, 25.00),
(3, 'Daikan', '代官', 5000, 0, 10.00),
(4, 'Bugyo', '奉行', 10000, 0, 6.00),
(5, 'Roju', '老中', 50000, 0, 5.00),
(6, 'Tairo', '大老', 100000, 0, 4.00),
(7, 'Daimyo', '大名', 300000, 0, 3.00),
(8, 'Shogun', '将軍', 600000, 0, 2.00);

INSERT INTO nft_types (name, price_usdt, daily_return_rate, category, is_special) VALUES
('SHOGUN NFT 300', 300, 0.005, 'regular', FALSE),
('SHOGUN NFT 500', 500, 0.005, 'regular', FALSE),
('SHOGUN NFT 1000', 1000, 0.010, 'regular', FALSE),
('SHOGUN NFT 3000', 3000, 0.010, 'regular', FALSE),
('SHOGUN NFT 5000', 5000, 0.010, 'regular', FALSE),
('SHOGUN NFT 10000', 10000, 0.0125, 'regular', FALSE),
('SHOGUN NFT 30000', 30000, 0.015, 'regular', FALSE),
('SHOGUN NFT 100000', 100000, 0.020, 'regular', FALSE);

INSERT INTO nft_types (name, price_usdt, daily_return_rate, category, is_special) VALUES
('SHOGUN NFT 100', 100, 0.005, 'special', TRUE),
('SHOGUN NFT 200', 200, 0.005, 'special', TRUE),
('SHOGUN NFT 600', 600, 0.005, 'special', TRUE),
('SHOGUN NFT 1177', 1177, 0.010, 'special', TRUE),
('SHOGUN NFT 1300', 1300, 0.010, 'special', TRUE),
('SHOGUN NFT 1500', 1500, 0.010, 'special', TRUE),
('SHOGUN NFT 2000', 2000, 0.010, 'special', TRUE),
('SHOGUN NFT 6600', 6600, 0.0125, 'special', TRUE),
('SHOGUN NFT 8000', 8000, 0.0125, 'special', TRUE);

INSERT INTO airdrop_tasks (name, description, question, choices, reward_amount) VALUES
('戦国武将アンケート', 'あなたの好きな戦国武将についてお答えください', 'あなたの好きな戦国武将は？', '["織田信長", "徳川家康", "豊臣秀吉", "その他"]', 10.00),
('投資戦略アンケート', 'SHOGUN TRADEでの投資戦略についてお聞かせください', 'あなたの投資スタイルは？', '["長期保有", "短期売買", "複利運用", "その他"]', 15.00),
('サービス満足度', 'SHOGUN TRADEのサービスについて評価してください', 'サービスの満足度は？', '["非常に満足", "満足", "普通", "その他"]', 20.00),
('紹介動機アンケート', 'SHOGUN TRADEを知ったきっかけについて教えてください', 'どこでSHOGUN TRADEを知りましたか？', '["友人紹介", "SNS", "広告", "その他"]', 12.00),
('今後の期待', 'SHOGUN TRADEに期待する機能について教えてください', '今後期待する機能は？', '["新しいNFT", "ボーナス増加", "UI改善", "その他"]', 18.00);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_referrer_id ON profiles(referrer_id);
CREATE INDEX idx_user_nfts_user_id ON user_nfts(user_id);
CREATE INDEX idx_user_nfts_nft_type_id ON user_nfts(nft_type_id);
CREATE INDEX idx_referral_tree_user_id ON referral_tree(user_id);
CREATE INDEX idx_referral_tree_referrer_id ON referral_tree(referrer_id);
CREATE INDEX idx_weekly_rewards_user_id ON weekly_rewards(user_id);
CREATE INDEX idx_weekly_rewards_week_start ON weekly_rewards(week_start);

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

CREATE POLICY "Users can view own referral tree" ON referral_tree FOR SELECT USING (auth.uid() = user_id);
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
