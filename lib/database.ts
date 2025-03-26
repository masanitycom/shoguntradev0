import { Pool } from "pg"

// Heroku PostgreSQLデータベース接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// データベース接続テスト
export async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query("SELECT NOW()")
    client.release()
    return { success: true, timestamp: result.rows[0].now }
  } catch (error) {
    console.error("Database connection error:", error)
    return { success: false, error }
  }
}

// ユーザー関連のクエリ
export const userQueries = {
  // ユーザー登録
  createUser: async (userData: any) => {
    const { name, userId, email, password, phoneNumber, referrerId, usdtAddress, walletType } = userData

    try {
      const client = await pool.connect()
      const result = await client.query(
        `INSERT INTO users (name, user_id, email, password, phone_number, referrer_id, usdt_address, wallet_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [name, userId, email, password, phoneNumber, referrerId, usdtAddress, walletType],
      )
      client.release()
      return { success: true, userId: result.rows[0].id }
    } catch (error) {
      console.error("Error creating user:", error)
      return { success: false, error }
    }
  },

  // ユーザー認証
  authenticateUser: async (identifier: string, password: string) => {
    try {
      const client = await pool.connect()
      const result = await client.query(
        `SELECT * FROM users 
         WHERE (user_id = $1 OR email = $1) AND password = $2`,
        [identifier, password],
      )
      client.release()

      if (result.rows.length > 0) {
        return { success: true, user: result.rows[0] }
      } else {
        return { success: false, error: "Invalid credentials" }
      }
    } catch (error) {
      console.error("Error authenticating user:", error)
      return { success: false, error }
    }
  },

  // ユーザー情報取得
  getUserById: async (userId: string) => {
    try {
      const client = await pool.connect()
      const result = await client.query("SELECT * FROM users WHERE id = $1", [userId])
      client.release()

      if (result.rows.length > 0) {
        return { success: true, user: result.rows[0] }
      } else {
        return { success: false, error: "User not found" }
      }
    } catch (error) {
      console.error("Error getting user:", error)
      return { success: false, error }
    }
  },
}

// NFT関連のクエリ
export const nftQueries = {
  // NFT一覧取得
  getAllNfts: async () => {
    try {
      const client = await pool.connect()
      const result = await client.query("SELECT * FROM nfts ORDER BY price")
      client.release()
      return { success: true, nfts: result.rows }
    } catch (error) {
      console.error("Error getting NFTs:", error)
      return { success: false, error }
    }
  },

  // ユーザーのNFT取得
  getUserNfts: async (userId: string) => {
    try {
      const client = await pool.connect()
      const result = await client.query(
        `SELECT un.*, n.name, n.price, n.daily_rate, n.image_url
         FROM user_nfts un
         JOIN nfts n ON un.nft_id = n.id
         WHERE un.user_id = $1`,
        [userId],
      )
      client.release()
      return { success: true, nfts: result.rows }
    } catch (error) {
      console.error("Error getting user NFTs:", error)
      return { success: false, error }
    }
  },

  // NFT購入
  purchaseNft: async (userId: string, nftId: string) => {
    try {
      const client = await pool.connect()

      // トランザクション開始
      await client.query("BEGIN")

      // NFT情報取得
      const nftResult = await client.query("SELECT * FROM nfts WHERE id = $1", [nftId])

      if (nftResult.rows.length === 0) {
        await client.query("ROLLBACK")
        client.release()
        return { success: false, error: "NFT not found" }
      }

      const nft = nftResult.rows[0]

      // 購入日と運用開始日を計算
      const purchaseDate = new Date()
      const operationStartDate = new Date(purchaseDate)
      operationStartDate.setDate(operationStartDate.getDate() + 7) // 1週間後

      // ユーザーNFT登録
      await client.query(
        `INSERT INTO user_nfts (user_id, nft_id, purchase_date, operation_start_date, current_reward, max_reward)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, nftId, purchaseDate, operationStartDate, 0, nft.price * 3], // 最大報酬は投資額の300%
      )

      // トランザクション確定
      await client.query("COMMIT")
      client.release()

      return { success: true }
    } catch (error) {
      console.error("Error purchasing NFT:", error)
      return { success: false, error }
    }
  },
}

// 報酬関連のクエリ
export const rewardQueries = {
  // 報酬申請
  claimReward: async (userId: string, claimType: string, feedback = "") => {
    try {
      const client = await pool.connect()

      // トランザクション開始
      await client.query("BEGIN")

      // ユーザーの報酬情報取得
      const rewardResult = await client.query(
        `SELECT SUM(current_reward) as total_reward
         FROM user_nfts
         WHERE user_id = $1 AND current_reward > 0`,
        [userId],
      )

      const totalReward = Number.parseFloat(rewardResult.rows[0].total_reward) || 0

      if (totalReward <= 0) {
        await client.query("ROLLBACK")
        client.release()
        return { success: false, error: "No reward to claim" }
      }

      // ユーザー情報取得
      const userResult = await client.query("SELECT wallet_type, usdt_address FROM users WHERE id = $1", [userId])

      const user = userResult.rows[0]

      // 手数料計算
      const feeRate = user.wallet_type === "evo" ? 0.055 : 0.08
      const fee = claimType === "airdrop" ? totalReward * feeRate : 0
      const netAmount = totalReward - fee

      // 報酬申請登録
      await client.query(
        `INSERT INTO reward_claims (user_id, claim_type, amount, fee, net_amount, feedback, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, claimType, totalReward, fee, netAmount, feedback, "pending"],
      )

      if (claimType === "compound") {
        // 複利運用の場合、報酬を投資額に加算
        // ここでは簡略化のため、最初のNFTに全額加算
        await client.query(
          `UPDATE user_nfts
           SET current_reward = 0
           WHERE user_id = $1 AND current_reward > 0`,
          [userId],
        )
      } else {
        // 報酬受取の場合、報酬をリセット
        await client.query(
          `UPDATE user_nfts
           SET current_reward = 0
           WHERE user_id = $1 AND current_reward > 0`,
          [userId],
        )
      }

      // トランザクション確定
      await client.query("COMMIT")
      client.release()

      return { success: true, amount: totalReward, fee, netAmount }
    } catch (error) {
      console.error("Error claiming reward:", error)
      return { success: false, error }
    }
  },

  // 報酬計算（管理者用）
  calculateRewards: async () => {
    try {
      const client = await pool.connect()

      // トランザクション開始
      await client.query("BEGIN")

      // 運用開始済みのNFTを取得
      const nftsResult = await client.query(
        `SELECT un.id, un.user_id, un.nft_id, un.current_reward, un.max_reward, n.price, n.daily_rate
         FROM user_nfts un
         JOIN nfts n ON un.nft_id = n.id
         WHERE un.operation_start_date <= CURRENT_DATE
         AND un.current_reward < un.max_reward`,
      )

      // 各NFTの日利を計算
      for (const nft of nftsResult.rows) {
        // 平日かどうかチェック（1:月曜～5:金曜）
        const today = new Date()
        const dayOfWeek = today.getDay()

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // 日利計算
          const dailyReward = nft.price * (nft.daily_rate / 100)

          // 最大報酬を超えないようにする
          const newReward = Math.min(nft.current_reward + dailyReward, nft.max_reward)

          // 報酬更新
          await client.query(
            `UPDATE user_nfts
             

             SET current_reward = $1
             WHERE id = $2`,
            [newReward, nft.id],
          )
        }
      }

      // トランザクション確定
      await client.query("COMMIT")
      client.release()

      return { success: true, processedCount: nftsResult.rows.length }
    } catch (error) {
      console.error("Error calculating rewards:", error)
      return { success: false, error }
    }
  },
}

// MLM関連のクエリ
export const mlmQueries = {
  // ユーザーのMLMランク取得
  getUserRank: async (userId: string) => {
    try {
      const client = await pool.connect()

      // ユーザーの投資額確認
      const userInvestmentResult = await client.query(
        `SELECT SUM(n.price) as total_investment
         FROM user_nfts un
         JOIN nfts n ON un.nft_id = n.id
         WHERE un.user_id = $1`,
        [userId],
      )

      const totalInvestment = Number.parseFloat(userInvestmentResult.rows[0].total_investment) || 0

      // SHOGUN NFT 1,000以上を持っているか確認
      const hasRequiredNftResult = await client.query(
        `SELECT COUNT(*) as count
         FROM user_nfts un
         JOIN nfts n ON un.nft_id = n.id
         WHERE un.user_id = $1 AND n.price >= 1000`,
        [userId],
      )

      const hasRequiredNft = Number.parseInt(hasRequiredNftResult.rows[0].count) > 0

      if (!hasRequiredNft) {
        client.release()
        return { success: true, rank: null, reason: "SHOGUN NFT 1,000以上の保有が必要です" }
      }

      // 紹介者のツリーを取得
      const referralsResult = await client.query(
        `WITH RECURSIVE referral_tree AS (
           SELECT id, user_id, referrer_id, 1 as level
           FROM users
           WHERE referrer_id = $1
           
           UNION ALL
           
           SELECT u.id, u.user_id, u.referrer_id, rt.level + 1
           FROM users u
           JOIN referral_tree rt ON u.referrer_id = rt.user_id
         )
         SELECT rt.user_id, rt.level, SUM(n.price) as investment
         FROM referral_tree rt
         LEFT JOIN user_nfts un ON rt.id = un.user_id
         LEFT JOIN nfts n ON un.nft_id = n.id
         GROUP BY rt.user_id, rt.level
         ORDER BY rt.level, investment DESC`,
        [userId],
      )

      // 最大系列と他系列の投資額を計算
      let maxLineInvestment = 0
      let otherLinesInvestment = 0

      if (referralsResult.rows.length > 0) {
        // 投資額でソート
        const sortedReferrals = [...referralsResult.rows].sort((a, b) => b.investment - a.investment)

        // 最大系列
        maxLineInvestment = Number.parseFloat(sortedReferrals[0].investment) || 0

        // 他系列
        otherLinesInvestment = sortedReferrals
          .slice(1)
          .reduce((sum, ref) => sum + (Number.parseFloat(ref.investment) || 0), 0)
      }

      // ランク判定
      let rank = "足軽"

      if (maxLineInvestment >= 600000 && otherLinesInvestment >= 500000) {
        rank = "将軍"
      } else if (maxLineInvestment >= 300000 && otherLinesInvestment >= 150000) {
        rank = "大名"
      } else if (maxLineInvestment >= 100000 && otherLinesInvestment >= 50000) {
        rank = "大老"
      } else if (maxLineInvestment >= 50000 && otherLinesInvestment >= 25000) {
        rank = "老中"
      } else if (maxLineInvestment >= 10000 && otherLinesInvestment >= 5000) {
        rank = "奉行"
      } else if (maxLineInvestment >= 5000 && otherLinesInvestment >= 2500) {
        rank = "代官"
      } else if (maxLineInvestment >= 3000 && otherLinesInvestment >= 1500) {
        rank = "武将"
      }

      client.release()

      return {
        success: true,
        rank,
        stats: {
          totalInvestment,
          maxLineInvestment,
          otherLinesInvestment,
          referralsCount: referralsResult.rows.length,
        },
      }
    } catch (error) {
      console.error("Error getting user rank:", error)
      return { success: false, error }
    }
  },

  // MLMボーナス計算（管理者用）
  calculateMlmBonus: async (totalBonus: number) => {
    try {
      const client = await pool.connect()

      // トランザクション開始
      await client.query("BEGIN")

      // 各ランクのユーザー数とボーナス率を取得
      const ranksData = [
        { rank: "足軽", rate: 0.45 },
        { rank: "武将", rate: 0.25 },
        { rank: "代官", rate: 0.1 },
        { rank: "奉行", rate: 0.06 },
        { rank: "老中", rate: 0.05 },
        { rank: "大老", rate: 0.04 },
        { rank: "大名", rate: 0.03 },
        { rank: "将軍", rate: 0.02 },
      ]

      // 各ランクのユーザー数を取得
      for (const rankData of ranksData) {
        const rankResult = await client.query(
          `SELECT COUNT(*) as count
           FROM users
           WHERE mlm_rank = $1`,
          [rankData.rank],
        )

        rankData.count = Number.parseInt(rankResult.rows[0].count)
      }

      // 各ランクの合計ボーナスを計算
      for (const rankData of ranksData) {
        if (rankData.count > 0) {
          const rankBonus = totalBonus * rankData.rate
          const bonusPerUser = rankBonus / rankData.count

          // 各ユーザーにボーナスを付与
          await client.query(
            `UPDATE users
             SET mlm_bonus = mlm_bonus + $1
             WHERE mlm_rank = $2`,
            [bonusPerUser, rankData.rank],
          )
        }
      }

      // トランザクション確定
      await client.query("COMMIT")
      client.release()

      return { success: true, ranksData }
    } catch (error) {
      console.error("Error calculating MLM bonus:", error)
      return { success: false, error }
    }
  },
}

// データベース初期化（テーブル作成）
export async function initializeDatabase() {
  try {
    const client = await pool.connect()

    // ユーザーテーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        referrer_id VARCHAR(50),
        usdt_address VARCHAR(100),
        wallet_type VARCHAR(20),
        mlm_rank VARCHAR(20) DEFAULT '足軽',
        mlm_bonus DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // NFTテーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS nfts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        daily_rate DECIMAL(5, 2) NOT NULL,
        is_special BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // ユーザーNFTテーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_nfts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        nft_id INTEGER REFERENCES nfts(id),
        purchase_date TIMESTAMP NOT NULL,
        operation_start_date TIMESTAMP NOT NULL,
        current_reward DECIMAL(15, 2) DEFAULT 0,
        max_reward DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 報酬申請テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS reward_claims (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        claim_type VARCHAR(20) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        fee DECIMAL(15, 2) NOT NULL,
        net_amount DECIMAL(15, 2) NOT NULL,
        feedback TEXT,
        status VARCHAR(20) NOT NULL,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 取引履歴テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        transaction_type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // システム設定テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    client.release()

    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error }
  }
}

