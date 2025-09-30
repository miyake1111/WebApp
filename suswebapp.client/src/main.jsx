// React 18のStrictModeをインポート（開発時の警告を強化）
import { StrictMode } from 'react'
// React 18の新しいレンダリングAPIをインポート
import { createRoot } from 'react-dom/client'
// グローバルCSSをインポート
import './index.css'
// メインアプリケーションコンポーネントをインポート
import App from './App.jsx'

/**
 * アプリケーションのエントリーポイント
 * React 18の新しいcreateRoot APIを使用してアプリケーションをレンダリング
 */

// root要素を取得してReactルートを作成
createRoot(document.getElementById('root')).render(
    // StrictModeで囲むことで開発時の潜在的な問題を検出
    // - 副作用の検出
    // - 廃止予定のAPIの使用警告
    // - 予期しない副作用の検出
    <StrictMode>
        <App />  {/* メインアプリケーションコンポーネント */}
    </StrictMode>,
)

/**
 * StrictModeの主な機能：
 * 1. 安全でないライフサイクルメソッドの警告
 * 2. レガシーなstring ref APIの警告
 * 3. 廃止予定のfindDOMNode使用の警告
 * 4. 予期しない副作用の検出
 * 5. レガシーなcontext APIの検出
 * 6. 再利用可能な状態の確保
 * 
 * 注意：StrictModeは開発環境でのみ動作し、
 * プロダクションビルドでは自動的に削除される
 */