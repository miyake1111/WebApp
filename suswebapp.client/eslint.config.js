// ESLintの推奨設定をインポート
import js from '@eslint/js'
// グローバル変数の定義をインポート（ブラウザ環境など）
import globals from 'globals'
// React Hooksのルールを提供するプラグイン
import reactHooks from 'eslint-plugin-react-hooks'
// React Fast Refreshのルールを提供するプラグイン（HMR用）
import reactRefresh from 'eslint-plugin-react-refresh'
// ESLintの設定ヘルパー関数をインポート
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * ESLint設定のエクスポート
 * Flat Config形式（ESLint 8.23.0以降の新形式）を使用
 */
export default defineConfig([
    // グローバル除外設定 - distディレクトリ（ビルド成果物）を検査対象から除外
    globalIgnores(['dist']),

    {
        // 対象ファイル - JavaScriptとJSXファイルのみ
        files: ['**/*.{js,jsx}'],

        // 継承する設定
        extends: [
            js.configs.recommended,                        // JavaScript標準の推奨ルール
            reactHooks.configs['recommended-latest'],      // React Hooksの最新推奨ルール
            reactRefresh.configs.vite,                    // Vite用React Fast Refreshルール
        ],

        // 言語オプション設定
        languageOptions: {
            ecmaVersion: 2020,                            // ECMAScript 2020の構文をサポート
            globals: globals.browser,                     // ブラウザのグローバル変数を認識

            // パーサーオプション
            parserOptions: {
                ecmaVersion: 'latest',                      // 最新のECMAScript構文を解析
                ecmaFeatures: { jsx: true },                // JSX構文を有効化
                sourceType: 'module',                       // ES Modulesとして解析
            },
        },

        // カスタムルール
        rules: {
            // 未使用変数の検出ルール
            // 大文字またはアンダースコアで始まる変数は除外（定数や意図的な未使用変数）
            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
        },
    },
])

/**
 * ESLint設定の主要ポイント：
 * 
 * 1. Flat Config形式
 *    - ESLint 8.23.0以降の新しい設定形式
 *    - より直感的で柔軟な設定が可能
 * 
 * 2. React開発用プラグイン
 *    - react-hooks: useEffectの依存配列などのチェック
 *    - react-refresh: Hot Module Replacementの正しい動作を保証
 * 
 * 3. 除外設定
 *    - distディレクトリはビルド成果物のため検査不要
 * 
 * 4. カスタムルール
 *    - 大文字定数や意図的な未使用変数を許可
 */