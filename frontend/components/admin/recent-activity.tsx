import { Badge } from "@/components/ui/badge"
import { Car, FileText, Truck, ArrowRightLeft, Settings, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Activity {
  id: string
  type: string
  description: string
  details: string
  user: string
  timestamp: string
  txHash: string
}

interface RecentActivityListProps {
  activities: Activity[]
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "mint":
        return <Car className="h-4 w-4 text-green-500" />
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
      case "crash":
        return <FileText className="h-4 w-4 text-red-500" />
      case "shipment":
        return <Truck className="h-4 w-4 text-yellow-500" />
      case "service":
        return <Settings className="h-4 w-4 text-purple-500" />
      default:
        return <Car className="h-4 w-4 text-primary" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "mint":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Mint</Badge>
      case "transfer":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Transfer</Badge>
      case "crash":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Crash</Badge>
      case "shipment":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Shipment</Badge>
      case "service":
        return <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">Service</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <div className="mt-1">{getActivityIcon(activity.type)}</div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{activity.description}</p>
              {getActivityBadge(activity.type)}
            </div>
            <p className="text-sm text-muted-foreground">{activity.details}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>By {activity.user}</span>
              <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
              <span className="truncate max-w-[180px] md:max-w-[300px]">{activity.txHash}</span>
              <a
                href={`https://etherscan.io/tx/${activity.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
