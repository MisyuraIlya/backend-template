export class CreateNotificationDto {
    notificationId: number
    who: "allAgents" | "allUsers"
}
