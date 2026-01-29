import {  useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteNotification,getNotifications, markAllAsRead, markAsRead } from "../../store/slices/notificationSlice";
import {
  BadgeCheck,
  Calendar,
  MessageCircle,
  Settings,
  User,
  AlertCircle,
  Clock,
  Clock5,
  CheckCircle2,
  ChevronDown,
  BellOff
} from "lucide-react";



const NotificationsPage = () => {
  
const dispatch=useDispatch();
const notifications=useSelector(state=>state.notification.list);
const unreadCount=useSelector(state=>state.notification.unreadCount);

useEffect(()=>{
  dispatch(getNotifications());
},[dispatch]);

const markAsReadHandler=(id)=>dispatch(markAsRead(id));
const markAllAsReadHandler=()=>dispatch(markAllAsRead());
const deleteNotificationHandler=(id)=>dispatch(deleteNotification(id));

const getNotificationIcon = (type) => {
  switch (type) {
    case "feedback":
      return <MessageCircle className="w-6 h-6 text-blue-500" />;

    case "deadline":
      return <Clock5 className="w-6 h-6 text-red-500" />;

    case "approval":
      return <BadgeCheck className="w-6 h-6 text-green-500" />;

    case "meeting":
      return <Calendar className="w-6 h-6 text-purple-500" />;

    case "system":
      return <Settings className="w-6 h-6 text-gray-500" />;

    default:
      // Custom combined icon (User + Down Arrow)
      return (
        <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
          <User className="w-5 h-5 absolute" />
          <ChevronDown className="w-4 h-4 absolute top-4" />
        </div>
      );
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "border border-red-500";
    case "medium":
      return "border border-yellow-500";
    case "low":
      return "border border-green-500";
    default:
      return "border border-slate-300";
  }
};


const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();

  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  if (diffDays === 1) {
    return "yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString();
};



const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      valueColor: "text-blue-900",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter((n) => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter((n) => {
        const notifDate = new Date(n.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];











  return (
  <>
    <div className="space-y-6">
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Notifications
              </h1>
              <p className="text-sm text-slate-500">
                Stay updated with your project progress and deadlines
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                className="px-4 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-100"
                onClick={markAllAsReadHandler}
              >
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((item, i) => (
            <div
              key={i}
              className={`${item.bg} rounded-xl p-4 flex items-center gap-3`}
            >
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <item.Icon className={`w-5 h-5 ${item.textColor}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${item.titleColor}`}>
                  {item.title}
                </p>
                <p className={`text-lg font-semibold ${item.valueColor}`}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`relative rounded-xl border p-4 transition-all hover:shadow-md
              ${
                notification.isRead
                  ? "bg-white border-slate-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-slate-900">
                      {notification.message}
                      {!notification.isRead && (
                        <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{formatDate(notification.createdAt)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                        ${
                          notification.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : notification.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {notification.priority}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-md text-xs capitalize
                      ${
                        notification.type === "feedback"
                          ? "bg-blue-100 text-blue-800"
                          : notification.type === "deadline"
                          ? "bg-red-100 text-red-800"
                          : notification.type === "approval"
                          ? "bg-green-100 text-green-800"
                          : notification.type === "meeting"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {notification.type}
                    </span>

                    <div className="flex items-center gap-3">
                      {!notification.isRead && (
                        <button
                          className="text-sm text-blue-600 hover:underline"
                          onClick={() =>
                            markAsReadHandler(notification._id)
                          }
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        className="text-sm text-red-600 hover:underline"
                        onClick={() =>
                          deleteNotificationHandler(notification._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <BellOff className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  </>
);

};

export default NotificationsPage;
