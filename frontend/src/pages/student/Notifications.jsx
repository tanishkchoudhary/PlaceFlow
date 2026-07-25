import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Check, Clock } from 'lucide-react';
import notificationService from '../../services/notificationService';
import EmptyState from '../../components/common/EmptyState';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="portal-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay informed about application status updates, interview schedules, and new job opportunities.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
            <CheckCheck size={18} /> Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You don't have any notifications at the moment. Important updates will appear here."
        />
      ) : (
        <div className="notifications-list-container">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item-card ${notif.is_read ? 'read' : 'unread'}`}
            >
              <div className="notif-icon-circle">
                <Bell size={20} />
              </div>
              <div className="notif-content">
                <div className="notif-header">
                  <h4 className="notif-title">{notif.title}</h4>
                  <span className="notif-time">
                    <Clock size={12} /> {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="notif-message">{notif.message}</p>
              </div>
              {!notif.is_read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="btn-mark-read"
                  title="Mark as read"
                >
                  <Check size={16} /> Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
