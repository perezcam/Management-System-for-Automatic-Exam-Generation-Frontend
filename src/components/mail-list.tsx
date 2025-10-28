import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Paperclip } from "lucide-react"
import { cn } from "./ui/utils"

export interface Email {
  id: string
  sender: string
  senderEmail: string
  subject: string
  preview: string
  date: string
  isRead: boolean
  isStarred: boolean
  hasAttachment: boolean
  labels: string[]
}

interface MailListProps {
  emails: Email[]
  selectedEmail: string | null
  onEmailSelect: (emailId: string) => void
}

export function MailList({ emails, selectedEmail, onEmailSelect }: MailListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-4 space-y-2">
        {emails.map((email) => (
          <Card
            key={email.id}
            className={cn(
              "p-4 cursor-pointer transition-colors hover:bg-muted/50",
              selectedEmail === email.id && "bg-muted",
              !email.isRead && "border-l-4 border-l-primary"
            )}
            onClick={() => onEmailSelect(email.id)}
          >
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(email.sender)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "truncate",
                      !email.isRead && "font-semibold"
                    )}>
                      {email.sender}
                    </span>
                    {email.labels.map((label) => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    {email.hasAttachment && (
                      <Paperclip className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(email.date)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-1">
                  <p className={cn(
                    "text-sm truncate",
                    !email.isRead && "font-semibold"
                  )}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {email.preview}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}