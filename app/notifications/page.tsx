import AppLayout from "@/components/layout/app-layout"
import { NotificationCenter } from "@/components/notifications/notification-center"

export default function Notifications() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay up to date with all cooperative activities and important alerts.
          </p>
        </div>
        
        <NotificationCenter />
      </div>
    </AppLayout>
  )
}