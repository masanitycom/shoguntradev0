/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // !! 警告 !!
        // 型エラーがあってもビルドを続行します
        // 本番環境では推奨されません
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig

