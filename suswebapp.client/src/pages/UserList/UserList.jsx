import React, { useState, useEffect } from 'react';
import './UserList.css';
import UserModal from './UserModal';
import DeleteConfirmModal from '../DeviceList/DeleteConfirmModal';
import UserHistoryModal from './UserHistoryModal';

const UserList = ({ onBack }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [detailView, setDetailView] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // 検索フィルタリング
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(user => {
                const matchCount = Object.values(user).filter(value =>
                    value && value.toString().toLowerCase().includes(query)
                ).length;
                return matchCount > 0;
            }).sort((a, b) => {
                // 含まれている回数でソート
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

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/user/list');
            const data = await response.json();

            if (data.success) {
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

    // 検索処理
    const handleSearch = () => {
        // searchQueryの変更でuseEffectが動作
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    // 詳細表示切り替え
    const toggleDetailView = () => {
        setDetailView(!detailView);
    };

    // その他の関数は変更なし...
    const handleAdd = () => {
        setSelectedUser(null);
        setShowAddModal(true);
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
        setDeleteMode(false);
    };

    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
        setEditMode(false);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleDeleteClick = (user) => {
        setDeleteTarget(user);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        try {
            const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            const response = await fetch(`/api/user/delete/${deleteTarget.employeeNo}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-EmployeeNo': currentUserEmployeeNo
                }
            });

            if (response.ok) {
                alert('削除しました');
                fetchUsers();
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

    const handleSave = async (formData) => {
        try {
            const currentUserEmployeeNo = localStorage.getItem('employeeNo') || 'A1002';

            const url = showEditModal
                ? `/api/user/update/${formData.employeeNo}`
                : '/api/user/create';
            const method = showEditModal ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-EmployeeNo': currentUserEmployeeNo  // ヘッダーに追加
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(showEditModal ? '更新しました' : '登録しました');
                fetchUsers();
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('保存エラー:', error);
            alert('保存に失敗しました');
        }
    };

    // 検索文字のハイライト
    const highlightText = (text, query) => {
        if (!query || !text) return text;
        const lowerText = text.toString().toLowerCase();
        const lowerQuery = query.toLowerCase();
        if (!lowerText.includes(lowerQuery)) return text;

        return <span className="highlight">{text}</span>;
    };

    return (
        <div className="user-list-container">
            <div className="user-list-header">
                <h2>ユーザー一覧</h2>
                <button className="back-btn" onClick={onBack}>
                    メニューに戻る
                </button>
            </div>

            {/* すべてを1行に配置 */}
            <div className="controls-container">
                {/* 左側：モードボタン */}
                <div className="mode-buttons-group">
                    <button
                        className="mode-btn add-mode-btn"
                        onClick={handleAdd}
                        title="新規登録"
                    >
                        <span className="icon-plus">+</span>
                    </button>
                    <button
                        className={`mode-btn delete-mode-btn ${deleteMode ? 'active' : ''}`}
                        onClick={toggleDeleteMode}
                        title="削除モード"
                    >
                        <span className="icon-minus">−</span>
                    </button>
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
                    <button
                        className="clear-search-btn"
                        onClick={handleClearSearch}
                        title="クリア"
                    >
                        ↻
                    </button>

                    <input
                        type="text"
                        className="search-input"
                        placeholder="検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />

                    <div className="search-history-buttons">
                        <button
                            className="history-btn"
                            onClick={() => setShowHistoryModal(true)}
                            title="更新履歴"
                        >
                            🕐
                        </button>
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
                <div className="loading">読み込み中...</div>
            ) : (
                <>
                    <div className="user-table-container">
                        <div className={`user-table-wrapper ${detailView ? 'detail-view' : ''}`}>
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>社員番号</th>
                                        <th>氏名</th>
                                        <th>氏名（フリガナ）</th>
                                        {!detailView ? (
                                            <>
                                                <th>電話番号</th>
                                                <th>メールアドレス</th>
                                                <th>役職</th>
                                                <th>PCアカウント権限</th>
                                                <th>更新日</th>
                                            </>
                                        ) : (
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
                                                className={user.retirementDate ? 'retired-row' : ''}
                                            >
                                                <td>
                                                    <div className="employee-no-cell">
                                                        {editMode && (
                                                            <button
                                                                className="inline-edit-btn"
                                                                onClick={() => handleEdit(user)}
                                                                title="編集"
                                                            >
                                                                ✎
                                                            </button>
                                                        )}
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
                                                <td>{highlightText(user.name, searchQuery)}</td>
                                                <td>{highlightText(user.nameKana, searchQuery)}</td>
                                                {!detailView ? (
                                                    <>
                                                        <td>{highlightText(user.phone, searchQuery)}</td>
                                                        <td>{highlightText(user.email, searchQuery)}</td>
                                                        <td>{highlightText(user.position || '-', searchQuery)}</td>
                                                        <td>{highlightText(user.pcAuthority, searchQuery)}</td>
                                                        <td>{user.updateDate ? new Date(user.updateDate).toLocaleDateString('ja-JP') : '-'}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{highlightText(user.department, searchQuery)}</td>
                                                        <td>{highlightText(user.phone, searchQuery)}</td>
                                                        <td>{highlightText(user.email, searchQuery)}</td>
                                                        <td>{highlightText(user.age, searchQuery)}</td>
                                                        <td>{highlightText(user.gender, searchQuery)}</td>
                                                        <td>{highlightText(user.position || '-', searchQuery)}</td>
                                                        <td>{highlightText(user.pcAuthority, searchQuery)}</td>
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

                        {/* 表示件数のみテーブル内に固定 */}
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

            <UserModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                user={null}
                onSave={handleSave}
                mode="add"
            />

            <UserModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={selectedUser}
                onSave={handleSave}
                mode="edit"
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                deviceName={deleteTarget?.name || deleteTarget?.employeeNo}  // 名前を表示
                deleteTarget={deleteTarget}  // オブジェクト全体を渡す
            />

            <UserHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
            />
        </div>
    );
};

export default UserList;