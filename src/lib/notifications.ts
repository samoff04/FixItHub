import { prisma } from "./db";
import { emitToUser } from "./socket-server";
import { NotificationType } from "@prisma/client";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  const notification = await prisma.notification.create({ data: params });
  emitToUser(params.userId, "notification:new", notification);
  return notification;
}