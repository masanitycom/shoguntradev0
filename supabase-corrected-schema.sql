DROP TABLE IF EXISTS public.weekly_rewards CASCADE;
DROP TABLE IF EXISTS public.rewards CASCADE;
DROP TABLE IF EXISTS public.nft_purchases CASCADE;
DROP TABLE IF EXISTS public.nft_types CASCADE;
DROP TABLE IF EXISTS public.nfts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_kana TEXT NOT NULL,
    user_id TEXT UNIQUE NOT NULL,
    phone TEXT,
    referrer_id TEXT,
    usdt_address TEXT,
    wallet_type TEXT DEFAULT 'その他',
    role TEXT DEFAULT 'user',
    current_level INTEGER DEFAULT 0,
    total_investment DECIMAL(15,2) DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    direct_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_kana TEXT NOT NULL,
    user_id TEXT UNIQUE NOT NULL,
    phone TEXT,
    referrer_id TEXT,
    usdt_address TEXT,
    wallet_type TEXT DEFAULT 'その他',
    role TEXT DEFAULT 'user',
    current_level INTEGER DEFAULT 0,
    total_investment DECIMAL(15,2) DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    direct_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.nft_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_usdt DECIMAL(15,2) NOT NULL,
    daily_return_rate DECIMAL(5,4) NOT NULL,
    max_return_percentage INTEGER DEFAULT 300,
    is_special BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.nfts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    daily_return_rate DECIMAL(5,4) NOT NULL,
    max_return_percentage INTEGER DEFAULT 300,
    is_special BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.nft_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    nft_id UUID,
    nft_type_id UUID,
    purchase_price DECIMAL(15,2) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_earned DECIMAL(15,2) DEFAULT 0,
    delivery_status TEXT DEFAULT 'pending',
    delivered_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (nft_id) REFERENCES public.nfts(id),
    FOREIGN KEY (nft_type_id) REFERENCES public.nft_types(id)
);

CREATE TABLE public.weekly_rewards (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    base_reward DECIMAL(15,2) DEFAULT 0,
    referral_bonus DECIMAL(15,2) DEFAULT 0,
    mlm_bonus DECIMAL(15,2) DEFAULT 0,
    total_reward DECIMAL(15,2) DEFAULT 0,
    is_claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    task_completed BOOLEAN DEFAULT false,
    task_answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reward_type TEXT NOT NULL,
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    week_start DATE,
    week_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.weekly_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT DEFAULT 'その他',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.nft_types (name, price_usdt, daily_return_rate, is_special) VALUES
('SHOGUN NFT 300', 300, 0.005, false),
('SHOGUN NFT 500', 500, 0.005, false),
('SHOGUN NFT 1000', 1000, 0.01, false),
('SHOGUN NFT 3000', 3000, 0.01, false),
('SHOGUN NFT 5000', 5000, 0.01, false),
('SHOGUN NFT 10000', 10000, 0.0125, false),
('SHOGUN NFT 30000', 30000, 0.015, false),
('SHOGUN NFT 100000', 100000, 0.02, false);

INSERT INTO public.nft_types (name, price_usdt, daily_return_rate, is_special) VALUES
('SHOGUN NFT 100', 100, 0.005, true),
('SHOGUN NFT 200', 200, 0.005, true),
('SHOGUN NFT 600', 600, 0.005, true),
('SHOGUN NFT 1177', 1177, 0.01, true),
('SHOGUN NFT 1300', 1300, 0.01, true),
('SHOGUN NFT 1500', 1500, 0.01, true),
('SHOGUN NFT 2000', 2000, 0.01, true),
('SHOGUN NFT 6600', 6600, 0.0125, true),
('SHOGUN NFT 8000', 8000, 0.0125, true);

INSERT INTO public.nfts (name, price, daily_return_rate, is_special)
SELECT name, price_usdt, daily_return_rate, is_special FROM public.nft_types;

CREATE INDEX idx_users_user_id ON public.users(user_id);
CREATE INDEX idx_users_referrer_id ON public.users(referrer_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_referrer_id ON public.profiles(referrer_id);
CREATE INDEX idx_nft_purchases_user_id ON public.nft_purchases(user_id);
CREATE INDEX idx_weekly_rewards_user_id ON public.weekly_rewards(user_id);
CREATE INDEX idx_rewards_user_id ON public.rewards(user_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.nft_types FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.nfts FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.nft_purchases FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.weekly_rewards FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.rewards FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.weekly_tasks FOR ALL USING (true);
