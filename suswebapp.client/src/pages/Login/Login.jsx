import React, { useState } from 'react';
import './Login.css';

/**
 * ログインコンポーネント
 * ユーザー認証を行い、システムへのアクセスを制御する
 * 
 * @param {Function} onLoginSuccess - ログイン成功時に呼び出される関数（親コンポーネントから渡される）
 */
const Login = ({ onLoginSuccess }) => {
    // === ステート管理 ===

    /**
     * 認証情報（社員番号とパスワード）を管理するステート
     * 初期値は両方とも空文字列
     */
    const [credentials, setCredentials] = useState({
        employeeNo: '',  // 社員番号
        password: ''     // パスワード
    });

    /**
     * エラーメッセージを管理するステート
     * エラーがない場合は空文字列
     */
    const [error, setError] = useState('');

    /**
     * ローディング状態を管理するステート
     * API通信中はtrue、それ以外はfalse
     */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * 入力フィールドの変更ハンドラ
     * 社員番号またはパスワードの入力を処理
     * 
     * @param {Event} e - 入力イベント
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;  // name属性とvalue値を取得

        // credentialsステートを更新（前の値を展開して特定のフィールドのみ更新）
        setCredentials(prev => ({
            ...prev,
            [name]: value  // name属性に対応するフィールドを更新
        }));

        // 入力時にエラーメッセージがある場合はクリア
        if (error) {
            setError('');
        }
    };

    /**
     * フォーム送信ハンドラ
     * ログイン認証処理を実行
     * 
     * @param {Event} e - フォーム送信イベント
     */
    const handleSubmit = async (e) => {
        e.preventDefault();  // フォームのデフォルト送信動作を防止
        setIsLoading(true);  // ローディング状態を開始
        setError('');        // 既存のエラーメッセージをクリア

        try {
            // バックエンドのログインAPIを呼び出し
            const response = await fetch('http://localhost:61319/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  // JSONデータを送信
                },
                body: JSON.stringify({
                    employeeNo: credentials.employeeNo,  // 社員番号
                    password: credentials.password       // パスワード
                })
            });

            // レスポンスをJSON形式で取得
            const data = await response.json();
            console.log('Login API response:', data);  // デバッグ用：API応答をコンソールに出力

            // ログイン成功の判定
            if (response.ok && data.success) {
                console.log('User data from API:', data.user);  // デバッグ用：ユーザーデータ
                console.log('EmployeeNo:', data.user.employeeNo);  // デバッグ用：社員番号

                // ログイン成功処理
                setIsLoading(false);  // ローディング状態を終了

                // ユーザー情報をローカルストレージに保存（ブラウザに永続化）
                localStorage.setItem('currentUser', JSON.stringify(data.user));  // ユーザー情報全体を保存
                localStorage.setItem('employeeNo', data.user.employeeNo);  // 社員番号を個別に保存（頻繁に参照するため）

                // 親コンポーネントに成功を通知
                if (onLoginSuccess) {
                    onLoginSuccess(data.user);
                }
            } else {
                // ログイン失敗処理
                setIsLoading(false);  // ローディング状態を終了
                setError(data.message || 'ログインに失敗しました');  // エラーメッセージを設定
            }
        } catch (err) {
            // ネットワークエラーや予期しないエラーの処理
            setIsLoading(false);  // ローディング状態を終了
            setError('サーバーに接続できませんでした。サーバーが起動していることを確認してください。');
            console.error('Login error:', err);  // エラー詳細をコンソールに出力
        }
    };

    return (
        // ログインページ全体のコンテナ
        <div className="login-container">
            {/* ログインカード（フォームを含む） */}
            <div className="login-card">
                {/* システムタイトル */}
                <h2 className="login-title">PC貸出管理システム</h2>

                {/* ログインフォーム */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {/* 社員番号入力フィールド */}
                    <div className="form-group">
                        <label className="form-label">社員番号</label>
                        <input
                            type="text"                    // テキスト入力
                            name="employeeNo"              // フィールド名（ステート更新用）
                            value={credentials.employeeNo} // 制御コンポーネント（ステートと同期）
                            onChange={handleInputChange}    // 入力変更ハンドラ
                            required                        // 必須入力
                            className="form-input"          // スタイルクラス
                            disabled={isLoading}            // ローディング中は無効化
                            autoComplete="username"         // ブラウザの自動補完機能用
                        />
                    </div>

                    {/* パスワード入力フィールド */}
                    <div className="form-group">
                        <label className="form-label">パスワード</label>
                        <input
                            type="password"                 // パスワード入力（文字が隠れる）
                            name="password"                 // フィールド名（ステート更新用）
                            value={credentials.password}    // 制御コンポーネント（ステートと同期）
                            onChange={handleInputChange}     // 入力変更ハンドラ
                            required                        // 必須入力
                            className="form-input"          // スタイルクラス
                            disabled={isLoading}            // ローディング中は無効化
                            autoComplete="current-password" // ブラウザの自動補完機能用
                        />
                    </div>

                    {/* エラーメッセージ表示エリア（エラーがある場合のみ表示） */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* ログインボタン */}
                    <button
                        type="submit"                              // フォーム送信ボタン
                        disabled={isLoading}                       // ローディング中は無効化
                        className={`login-btn ${isLoading ? 'loading' : ''}`}  // 条件付きクラス
                    >
                        {/* ローディング中はテキストを変更 */}
                        {isLoading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;