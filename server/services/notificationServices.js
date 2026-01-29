import { Notification } from "../models/notification.js";
import { ErrorHandler } from "../middlewares/error.js";

export const createNotification = async (notificationData) => {
  if (!notificationData.user || !notificationData.message) {
    throw new ErrorHandler("Invalid notification data", 400);
  }

  return await Notification.create(notificationData);
};

export const notifyUser = async (
  userId,
  message,
  type = "general",
  link = null,
  priority = "low"
) => {
  return await createNotification({
    user: userId,
    message,
    type,
    link,
    priority,
  });
};

export const markAsRead=async(notificationId,userId)=>{
  return await Notification.findOneAndUpdate({_id:notificationId, user:userId},{isRead:true},{new:true});
};
export const markAllAsRead=async(userId)=>{
  return await Notification.updateMany({user:userId, isRead:false},{isRead:true});
};
export const deleteNotification=async(notificationId,userId)=>{
  return await Notification.findOneAndDelete({_id:notificationId, user:userId});
};


