// Notification System
let notifications = [];
let unreadCount = 0;

// Fetch notifications for the logged-in user
async function fetchNotifications() {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    const response = await fetch(`https://echomarket-8ipi.onrender.com/api/notifications?userId=${userId}`);
    const data = await response.json();
    
    if (data.success) {
      notifications = data.notifications;
      unreadCount = data.unreadCount;
      updateNotificationBadge();
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

// Update notification badge count
function updateNotificationBadge() {
  const badge = document.getElementById("notification-badge");
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Toggle notification dropdown
function toggleNotificationDropdown() {
  const dropdown = document.getElementById("notification-dropdown");
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
    renderNotifications();
  }
}

// Render notifications in dropdown
function renderNotifications() {
  const container = document.getElementById("notification-list");
  
  if (notifications.length === 0) {
    container.innerHTML = `
      <div style="padding: 30px; text-align: center; color: #999;">
        <p>No notifications yet</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = notifications.map(notif => `
    <div class="notification-item ${notif.isRead ? 'read' : 'unread'}" 
         onclick="markAsRead('${notif._id}')" 
         style="cursor: pointer;">
      <div class="notification-content">
        <strong>${notif.title}</strong>
        <p>${notif.message}</p>
        <small>${new Date(notif.createdAt).toLocaleString()}</small>
      </div>
      ${!notif.isRead ? '<div class="unread-dot"></div>' : ''}
    </div>
  `).join('');
}

// Mark notification as read
async function markAsRead(notificationId) {
  try {
    await fetch(`https://echomarket-8ipi.onrender.com/api/notifications/${notificationId}/read`, {
      method: "PUT"
    });
    
    // Update local state
    const notification = notifications.find(n => n._id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      unreadCount = Math.max(0, unreadCount - 1);
      updateNotificationBadge();
      renderNotifications();
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

// Mark all as read
async function markAllAsRead() {
  try {
    const userId = localStorage.getItem("userId");
    await fetch(`https://echomarket-8ipi.onrender.com/api/notifications/read-all?userId=${userId}`, {
      method: "PUT"
    });
    
    notifications.forEach(n => n.isRead = true);
    unreadCount = 0;
    updateNotificationBadge();
    renderNotifications();
  } catch (error) {
    console.error("Error marking all as read:", error);
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById("notification-dropdown");
  const bellIcon = document.getElementById("notification-bell");
  
  if (dropdown && bellIcon && 
      !dropdown.contains(event.target) && 
      !bellIcon.contains(event.target)) {
    dropdown.style.display = "none";
  }
});

// Fetch notifications on page load
fetchNotifications();

// Refresh notifications every 30 seconds
setInterval(fetchNotifications, 30000);

// Make functions globally accessible
window.toggleNotificationDropdown = toggleNotificationDropdown;
window.markAsRead = markAsRead;
window.markAllAsRead = markAllAsRead;

