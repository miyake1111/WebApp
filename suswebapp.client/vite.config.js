// Node.jsのURL操作用ユーティリティ
import { fileURLToPath, URL } from 'node:url';
// Viteの設定定義関数
import { defineConfig } from 'vite';
// React用Viteプラグイン
import plugin from '@vitejs/plugin-react';
// ファイルシステム操作用
import fs from 'fs';
// パス操作用
import path from 'path';
// 子プロセス実行用（証明書生成に使用）
import child_process from 'child_process';
// 環境変数アクセス用
import { env } from 'process';

/**
 * HTTPS証明書の設定
 * ASP.NET Core開発用の自己署名証明書を使用
 */

// 証明書保存フォルダーの決定（Windows/Mac/Linux対応）
const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`              // Windows: %APPDATA%/ASP.NET/https
        : `${env.HOME}/.aspnet/https`;                // Mac/Linux: ~/.aspnet/https

// 証明書名（プロジェクト名と一致）
const certificateName = "suswebapp.client";

// 証明書ファイルのパス
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);  // 証明書本体
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);   // 秘密鍵

// 証明書フォルダーが存在しない場合は作成
if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });    // 親ディレクトリも含めて作成
}

// 証明書が存在しない場合は生成
if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    // dotnet dev-certsコマンドで証明書を生成
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,                                // 出力先パス
        '--format',
        'Pem',                                       // PEM形式で出力
        '--no-password',                             // パスワードなし
    ], { stdio: 'inherit', }).status) {              // 標準入出力を継承
        throw new Error("Could not create certificate.");
    }
}

// バックエンドサーバーのURL設定
// ASP.NET Coreバックエンドのデフォルトポート
const target = 'http://localhost:61319';

/**
 * Vite設定のエクスポート
 * https://vitejs.dev/config/
 */
export default defineConfig({
    // プラグイン設定
    plugins: [plugin()],                            // Reactプラグインを使用

    // パス解決設定
    resolve: {
        alias: {
            // @をsrcディレクトリのエイリアスとして設定
            // import '@/components/...' のような記法が可能に
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },

    // 開発サーバー設定
    server: {
        // プロキシ設定（APIリクエストをバックエンドに転送）
        proxy: {
            // /apiで始まるリクエスト
            '^/api': {
                target,                              // バックエンドURL
                secure: false,                       // SSL証明書の検証をスキップ
                changeOrigin: true                   // Originヘッダーを変更
            },
            // /weatherforecastエンドポイント（サンプルAPI）
            '^/weatherforecast': {
                target,                              // バックエンドURL
                secure: false                        // SSL証明書の検証をスキップ
            }
        },

        // 開発サーバーのポート番号
        // 環境変数 DEV_SERVER_PORT が設定されていればそれを使用、なければ61317
        port: parseInt(env.DEV_SERVER_PORT || '61317'),

        // HTTPS設定（自己署名証明書を使用）
        https: {
            key: fs.readFileSync(keyFilePath),      // 秘密鍵を読み込み
            cert: fs.readFileSync(certFilePath),    // 証明書を読み込み
        }
    }
})

/**
 * Vite設定の主要ポイント：
 * 
 * 1. HTTPS開発サーバー
 *    - ASP.NET Coreと同じ証明書を使用
 *    - セキュアな開発環境を提供
 * 
 * 2. プロキシ設定
 *    - /apiリクエストをバックエンドに転送
 *    - CORSエラーを回避
 * 
 * 3. パスエイリアス
 *    - @をsrcディレクトリのショートカットとして使用
 *    - インポート文を簡潔に記述可能
 * 
 * 4. React Fast Refresh
 *    - プラグインにより自動的に有効化
 *    - 開発時の高速リロードを実現
 * 
 * 5. ポート設定
 *    - フロントエンド: 61317（デフォルト）
 *    - バックエンド: 61319
 *    - 環境変数で変更可能
 */