import React, { useState, useEffect } from 'react';
import './UserList.css';
import UserModal from './UserModal';
import DeleteConfirmModal from '../DeviceList/DeleteConfirmModal';
import UserHistoryModal from './UserHistoryModal';
import PasswordSetModal from './PasswordSetModal';  // パスワード設定モーダル追加

/**
 * ユーザー一覧コンポーネント
 * ユーザーの一覧表示、検索、CRUD操作を提供するメインコンポーネント
 * 
 * @param {Function} onBack - メニューに戻る関数（親コンポーネントから渡される）
 */
const UserList = ({ onBack }) => {
    // === ステート管理 ===
    const [users, setUsers] = useState([]);                        // 全ユーザーデータ
    const [filteredUsers, setFilteredUsers] = useState([]);        // フィルタリング後のユーザー
    const [loading, setLoading] = useState(true);                  // ローディング状態
    const [showAddModal, setShowAddModal] = useState(false);       // 新規登録モーダル表示状態
    const [showEditModal, setShowEditModal] = useState(false);     // 編集モーダル表示状態
    const [showDeleteModal, setShowDeleteModal] = useState(false); // 削除確認モーダル表示状態
    const [showHistoryModal, setShowHistoryModal] = useState(false); // 履歴モーダル表示状態
    const [showPasswordModal, setShowPasswordModal] = useState(false);  // パスワード設定モーダル表示状態（追加）
    const [selectedUser, setSelectedUser] = useState(null);        // 編集対象ユーザー
    const [deleteTarget, setDeleteTarget] = useState(null);        // 削除対象ユーザー
    const [newUserData, setNewUserData] = useState(null);          // 新規登録ユーザー情報（パスワード設定用）
    const [editMode, setEditMode] = useState(false);               // 編集モード
    const [deleteMode, setDeleteMode] = useState(false);           // 削除モード
    const [detailView, setDetailView] = useState(false);           // 詳細表示モード
    const [searchQuery, setSearchQuery] = useState('');            // 検索クエリ

    /**
     * コンポーネントマウント時にユーザー一覧を取得
     */
    useEffect(() => {
        fetchUsers();
    }, []);

    /**
     * 検索クエリに基づいてユーザーをフィルタリング
     * 複数のフィールドを検索し、一致度でソート
     */
    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(user => {
                // 各フィールドで検索文字列と一致するかチェック
                const matchCount = Object.values(user).filter(value =>
                    value && value.toString().toLowerCase().includes(query)
                ).length;
                return matchCount > 0;
            }).sort((a, b) => {
                // マッチ数の多い順にソート（関連度順）
                const aCount = Object.values(a).filter(value =>
                    value && value.toString().toLowerCase().includes(query)
                ).length;
                const bCount = Object.values(b).filter(value =>
                    value && value.toString().toLowerCase().includes(query)
                ).length;
                return bCount - aCount;
            });
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    /**
     * APIからユーザー一覧を取得し、社員番号でソート
     */
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/user/list');
            const data = await response.json();

            if (data.success) {
                // 社員番号でソート
                const sortedUsers = data.data.sort((a, b) => {
                    return a.employeeNo.localeCompare(b.employeeNo);
                });
                setUsers(sortedUsers);
                setFilteredUsers(sortedUsers);
            }
        } catch (error) {
            console.error('ユーザー一覧の取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * 検索処理（現在はsearchQueryの変更でuseEffectが動作するため空）
     */
    const handleSearch = () => {
        // searchQueryの変更でuseEffectが動作
    };

    /**
     * 検索クエリをクリア
     */
    const handleClearSearch = () => {
        setSearchQuery('');
    };

    /**
     * 詳細表示モードの切り替え
     * 追加カラム（部署、年齢、性別など）を表示/非表示
     */
    const toggleDetailView = () => {
        setDetailView(!detailView);
    };

    /**
     * 新規登録モーダルを開く
     */
    const handleAdd = () => {
        setSelectedUser(null);  // 選択ユーザーをクリア
        setShowAddModal(true);
    };

    /**
     * 編集モードの切り替え
     * 編集モードON時は削除モードをOFF
     */
    const toggleEditMode = () => {
        setEditMode(!editMode);
        setDeleteMode(false);  // 削除モードは解除
    };

    /**
     * 削除モードの切り替え
     * 削除モードON時は編集モードをOFF
     */
    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
        setEditMode(false);  // 編集モードは解除
    };

    /**
     * 編集モーダルを開く
     * 
     * @param {Object} user - 編集対象のユーザー
     */
    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    /**
     * 削除確認モーダルを開く
     * 
     * @param {Object} user - 削除対象のユーザー
     */
    const handleDeleteClick = (user) => {
        setDeleteTarget(user);
        setShowDeleteModal(true);
    };

    /**
     * 削除実行処理
     * 削除確認モーダルからの確認後に実行
     */
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        try {
            const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            // 削除APIを呼び出し（論理削除）
            const response = await fetch(`/api/user/delete/${deleteTarget.employeeNo}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-EmployeeNo': currentUserEmployeeNo  // 削除実行者の記録用
                }
            });

            if (response.ok) {
                alert('削除しました');
                fetchUsers();  // 一覧を再取得
            } else {
                alert('削除に失敗しました');
            }
        } catch (error) {
            console.error('削除エラー:', error);
            alert('削除に失敗しました');
        }

        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    /**
     * ユーザー情報の保存（新規登録/更新）
     * 
     * @param {Object} formData - フォームデータ
     */
    const handleSave = async (formData) => {
        try {
            const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            // リクエストデータの準備
            const requestData = {
                employeeNo: formData.employeeNo,
                name: formData.name || null,
                nameKana: formData.nameKana || null,
                department: formData.department || null,
                phone: formData.phone || null,
                email: formData.email || null,
                age: parseInt(formData.age) || 0,
                gender: formData.gender || null,
                position: formData.position || null,
                pcAuthority: formData.pcAuthority || null,
                registrationDate: formData.registrationDate ? new Date(formData.registrationDate).toISOString() : null,
                retirementDate: formData.retirementDate ? new Date(formData.retirementDate).toISOString() : null
            };

            // モードに応じてURL/メソッドを決定
            const url = showEditModal
                ? `/api/user/update/${formData.employeeNo}`  // 更新
                : '/api/user/create';                        // 新規作成
            const method = showEditModal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-EmployeeNo': currentUserEmployeeNo  // 操作者の記録用
                },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                if (showAddModal) {
                    // 新規登録の場合、パスワード設定モーダルを表示
                    setNewUserData({
                        employeeNo: formData.employeeNo,
                        employeeName: formData.name
                    });
                    setShowPasswordModal(true);
                }

                alert(showEditModal ? '更新しました' : '登録しました');
                fetchUsers();  // 一覧を再取得
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedUser(null);
            } else {
                const errorData = await response.text();
                console.error('エラー詳細:', errorData);
                alert('保存に失敗しました');
            }
        } catch (error) {
            console.error('保存エラー:', error);
            alert('保存に失敗しました');
        }
    };

    /**
     * パスワード設定完了時の処理
     */
    const handlePasswordSet = () => {
        setShowPasswordModal(false);
        setNewUserData(null);
    };

    /**
     * 検索文字のハイライト処理
     * 
     * @param {string} text - 表示テキスト
     * @param {string} query - 検索クエリ
     * @returns {JSX.Element|string} ハイライト付きテキスト
     */
    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const lowerText = text.toString().toLowerCase();
        const lowerQuery = query.toLowerCase();
        if (!lowerText.includes(lowerQuery)) return text;

        // マッチした場合は黄色背景でハイライト
        return <span className="highlight">{text}</span>;
    };

    return (
        <div className="user-list-container">
            {/* ヘッダー部分 */}
            <div className="user-list-header">
                <h2>ユーザー一覧</h2>
                <button className="back-btn" onClick={onBack}>
                    メニューに戻る
                </button>
            </div>

            {/* コントロール部分 - すべてを1行に配置 */}
            <div className="controls-container">
                {/* 左側：モードボタン */}
                <div className="mode-buttons-group">
                    {/* 新規登録ボタン */}
                    <button
                        className="mode-btn add-mode-btn"
                        onClick={handleAdd}
                        title="新規登録"
                    >
                        <span className="icon-plus">+</span>
                    </button>
                    {/* 削除モードボタン */}
                    <button
                        className={`mode-btn delete-mode-btn ${deleteMode ? 'active' : ''}`}
                        onClick={toggleDeleteMode}
                        title="削除モード"
                    >
                        <span className="icon-minus">−</span>
                    </button>
                    {/* 編集モードボタン */}
                    <button
                        className={`mode-btn edit-mode-btn ${editMode ? 'active' : ''}`}
                        onClick={toggleEditMode}
                        title="編集モード"
                    >
                        <span className="icon-pen">✎</span>
                    </button>
                </div>

                {/* 右側：検索関連 */}
                <div className="search-group">
                    {/* 検索クリアボタン */}
                    <button
                        className="clear-search-btn"
                        onClick={handleClearSearch}
                        title="クリア"
                    >
                        ↻
                    </button>

                    {/* 検索入力フィールド */}
                    <input
                        type="text"
                        className="search-input"
                        placeholder="検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />

                    {/* 履歴と検索ボタン（縦配置） */}
                    <div className="search-history-buttons">
                        {/* 更新履歴ボタン */}
                        <button
                            className="history-btn"
                            onClick={() => setShowHistoryModal(true)}
                            title="更新履歴"
                        >
                            🕐
                        </button>
                        {/* 検索ボタン */}
                        <button
                            className="search-btn"
                            onClick={handleSearch}
                            title="検索"
                        >
                            🔍
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                // ローディング中表示
                <div className="loading">読み込み中...</div>
            ) : (
                <>
                    {/* ユーザーテーブル */}
                    <div className="user-table-container">
                        <div className={`user-table-wrapper ${detailView ? 'detail-view' : ''}`}>
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>社員番号</th>
                                        <th>氏名</th>
                                        <th>氏名（フリガナ）</th>
                                        {!detailView ? (
                                            // 簡略表示時のカラム
                                            <>
                                                <th>電話番号</th>
                                                <th>メールアドレス</th>
                                                <th>役職</th>
                                                <th>PCアカウント権限</th>
                                                <th>更新日</th>
                                            </>
                                        ) : (
                                            // 詳細表示時の追加カラム
                                            <>
                                                <th>所属部門</th>
                                                <th>電話番号</th>
                                                <th>メールアドレス</th>
                                                <th>年齢</th>
                                                <th>性別</th>
                                                <th>役職</th>
                                                <th>PCアカウント権限</th>
                                                <th>登録日</th>
                                                <th>更新日</th>
                                                <th>退職日</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.employeeNo}
                                            className={user.retirementDate ? 'retired-row' : ''}  // 退職者はグレー表示
                                        >
                                            <td>
                                                <div className="employee-no-cell">
                                                    {/* 編集モード時のインライン編集ボタン */}
                                                    {editMode && (
                                                        <button
                                                            className="inline-edit-btn"
                                                            onClick={() => handleEdit(user)}
                                                            title="編集"
                                                        >
                                                            ✎
                                                        </button>
                                                    )}
                                                    {/* 削除モード時のインライン削除ボタン */}
                                                    {deleteMode && (
                                                        <button
                                                            className="inline-delete-btn"
                                                            onClick={() => handleDeleteClick(user)}
                                                            title="削除"
                                                        >
                                                            −
                                                        </button>
                                                    )}
                                                    <span>{highlightText(user.employeeNo, searchQuery)}</span>
                                                </div>
                                            </td>
                                            <td>{highlightText(user.name || '-', searchQuery)}</td>
                                            <td>{highlightText(user.nameKana || '-', searchQuery)}</td>
                                            {!detailView ? (
                                                // 簡略表示時のデータ
                                                <>
                                                    <td>{highlightText(user.phone || '-', searchQuery)}</td>
                                                    <td>{highlightText(user.email || '-', searchQuery)}</td>
                                                    <td>{highlightText(user.position || '-', searchQuery)}</td>
                                                    <td>{highlightText(user.pcAuthority || '-', searchQuery)}</td>
                                                    <td>{user.updateDate ? new Date(user.updateDate).toLocaleDateString('ja-JP') : '-'}</td>
                                                </>
                                            ) : (
                                                // 詳細表示時の追加データ
                                                <>
                                                    <td>{highlightText(user.department || '-', searchQuery)}</td>
                                                    <td>{highlightText(user.phone || '-', searchQuery)}</td>
                                                    <td>{highlightText(user.email || '-', searchQuery)}</td>
                                                    <td>{user.age || '-'}</td>
                                                    <td>{user.gender || '-'}</td>
                                                    <td>{highlightText(user.position || '-', searchQuery)}</td>
                                                    <td>{highlightText(user.pcAuthority || '-', searchQuery)}</td>
                                                    <td>{user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('ja-JP') : '-'}</td>
                                                    <td>{user.updateDate ? new Date(user.updateDate).toLocaleDateString('ja-JP') : '-'}</td>
                                                    <td>{user.retirementDate ? new Date(user.retirementDate).toLocaleDateString('ja-JP') : '-'}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 表示件数 */}
                        <div className="table-footer">
                            <span className="record-count">
                                表示中：{filteredUsers.length}件
                            </span>
                        </div>
                    </div>

                    {/* 詳細ボタンはテーブルの外 */}
                    <div className="detail-button-container">
                        <button
                            className="detail-toggle-btn"
                            onClick={toggleDetailView}
                            title={detailView ? "簡略表示" : "詳細表示"}
                        >
                            •••
                        </button>
                    </div>
                </>
            )}

            {/* 新規登録モーダル */}
            <UserModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                user={null}
                onSave={handleSave}
                mode="add"
            />

            {/* 編集モーダル */}
            <UserModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={selectedUser}
                onSave={handleSave}
                mode="edit"
            />

            {/* 削除確認モーダル */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                userName={deleteTarget?.name}
            />

            {/* 履歴モーダル */}
            <UserHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
            />

            {/* パスワード設定モーダル */}
            <PasswordSetModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                employeeNo={newUserData?.employeeNo}
                employeeName={newUserData?.employeeName}
                onPasswordSet={handlePasswordSet}
            />
        </div>
    );
};

export default UserList;