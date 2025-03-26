/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // 画像最適化の設定
    images: {
        // 画像を提供するドメインのリスト
        domains: ['localhost', 'shogun-trade.com'],
        // 開発環境では画像最適化を無効化（オプション）
        unoptimized: process.env.NODE_ENV !== 'production',
    },

    // 国際化設定（必要な場合）
    i18n: {
        locales: ['ja'],
        defaultLocale: 'ja',
    },

    // 環境変数の公開設定（必要な場合）
    env: {
        SITE_URL: 'https://shogun-trade.com',
    },

    // Netlify用の設定
    // Netlify Pluginが自動的に処理するので通常は不要
}

module.exports = nextConfig