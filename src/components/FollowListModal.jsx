// src/components/FollowListModal.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import { fetchFollowers, fetchFollowing } from '@/api/followApi';

export default function FollowListModal({ isOpen, onClose, userId, type }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!isOpen || !userId) return;

    const loadUsers = async () => {
      setLoading(true);
      try {
        const fetchFn = type === 'followers' ? fetchFollowers : fetchFollowing;
        const response = await fetchFn(userId);
        setUsers(response.data.content || []);
      } catch (error) {
        console.error(`${type} 목록 로드 실패:`, error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [isOpen, userId, type]);

  const title = type === 'followers' ? '팔로워' : '팔로잉';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {loading ? (
          <p>불러오는 중...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-500">사용자가 없습니다.</p>
        ) : (
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-3">
                <img src={user.profileImageUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt="" className="h-10 w-10 rounded-full object-cover"/>
                <Link to={`/profile/${user.id}`} onClick={onClose} className="font-semibold hover:underline">
                  {user.fullName || user.username}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}