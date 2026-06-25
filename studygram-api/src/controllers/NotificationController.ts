import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { notificationService } from '../services/NotificationService';

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const notifications = await notificationService.getUserNotifications(userId);
      res.status(200).json({
        status: 'success',
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const notification = await notificationService.markAsRead(userId, Number(id));
      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read.',
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
