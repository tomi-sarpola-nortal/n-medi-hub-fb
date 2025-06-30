
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notificationService';
import type { Notification } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user?.id) {
      const fetchNotifications = async () => {
        const userNotifications = await getNotificationsForUser(user.id);
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.isRead).length);
      };
      fetchNotifications();

      // Simple polling for updates every 2 minutes
      const interval = setInterval(fetchNotifications, 120000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleNotificationClick = async (notification: Notification) => {
    startTransition(async () => {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
        // Optimistically update the local state to hide the notification
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      router.push(notification.link);
      setIsOpen(false);
    });
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    startTransition(async () => {
        await markAllNotificationsAsRead(user.id);
        // Optimistically update the local state to hide all notifications
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    });
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
            <h4 className="font-medium text-sm">Notifications</h4>
            {unreadCount > 0 && (
                <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={handleMarkAllAsRead}
                    disabled={isPending}
                >
                    Mark all as read
                </Button>
            )}
        </div>
        <ScrollArea className="h-96">
            {unreadNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    You have no new notifications.
                </div>
            ) : (
                unreadNotifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="p-3 flex items-start gap-3 hover:bg-accent cursor-pointer bg-accent/50"
                        onClick={() => handleNotificationClick(notification)}
                    >
                        <div
                            className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0 bg-primary"
                        />
                        <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
