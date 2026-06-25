import { BaseRepository } from './BaseRepository';
import { Notification } from '../database/models/Notification';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super(Notification);
  }

  async findUserNotifications(userId: number): Promise<Notification[]> {
    return this.findAll({
      where: { userId },
      order: [['created_at', 'DESC']]
    });
  }
}

export const notificationRepository = new NotificationRepository();
