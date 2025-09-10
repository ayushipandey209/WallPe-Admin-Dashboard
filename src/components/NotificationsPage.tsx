import { useState } from 'react';
import { Send, Bell, Calendar, User, Users, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { mockNotifications, mockUsers, type Notification } from '../data/mockData';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // New notification form state
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    recipientType: 'individual' as 'individual' | 'group' | 'all',
    selectedUsers: [] as string[],
    scheduleType: 'now' as 'now' | 'later',
    scheduleDate: ''
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchQuery || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) return;

    const recipients = newNotification.recipientType === 'all' 
      ? ['All Users']
      : newNotification.recipientType === 'group'
        ? ['Selected Group']
        : newNotification.selectedUsers.map(userId => 
            mockUsers.find(u => u.id === userId)?.name || 'Unknown User'
          );

    recipients.forEach((recipient, index) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${index}`,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        date: newNotification.scheduleType === 'now' 
          ? new Date().toISOString().split('T')[0]
          : newNotification.scheduleDate,
        status: newNotification.scheduleType === 'now' ? 'sent' : 'scheduled',
        recipient: recipient
      };
      
      setNotifications(prev => [notification, ...prev]);
    });

    // Reset form
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      recipientType: 'individual',
      selectedUsers: [],
      scheduleType: 'now',
      scheduleDate: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: 'default' as const,
      scheduled: 'secondary' as const,
      pending: 'outline' as const
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Create Notification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title..."
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={newNotification.type} 
                onValueChange={(value: any) => setNewNotification({...newNotification, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your notification message..."
              rows={3}
              value={newNotification.message}
              onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <Label>Recipients</Label>
            <RadioGroup 
              value={newNotification.recipientType} 
              onValueChange={(value: any) => setNewNotification({...newNotification, recipientType: value})}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Individual Users
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="group" id="group" />
                <Label htmlFor="group" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Groups
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  All Users
                </Label>
              </div>
            </RadioGroup>

            {newNotification.recipientType === 'individual' && (
              <div className="space-y-2">
                <Label>Select Users</Label>
                <div className="max-h-32 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={user.id}
                        checked={newNotification.selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewNotification({
                              ...newNotification,
                              selectedUsers: [...newNotification.selectedUsers, user.id]
                            });
                          } else {
                            setNewNotification({
                              ...newNotification,
                              selectedUsers: newNotification.selectedUsers.filter(id => id !== user.id)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={user.id} className="text-sm">
                        {user.name} ({user.email})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Schedule</Label>
            <RadioGroup 
              value={newNotification.scheduleType} 
              onValueChange={(value: any) => setNewNotification({...newNotification, scheduleType: value})}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="now" />
                <Label htmlFor="now" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Now
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="later" id="later" />
                <Label htmlFor="later" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule for Later
                </Label>
              </div>
            </RadioGroup>

            {newNotification.scheduleType === 'later' && (
              <Input
                type="datetime-local"
                value={newNotification.scheduleDate}
                onChange={(e) => setNewNotification({...newNotification, scheduleDate: e.target.value})}
              />
            )}
          </div>

          <Button 
            onClick={handleSendNotification}
            disabled={!newNotification.title || !newNotification.message || 
              (newNotification.recipientType === 'individual' && newNotification.selectedUsers.length === 0)}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {newNotification.scheduleType === 'now' ? 'Send Now' : 'Schedule Notification'}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications History */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>{getTypeBadge(notification.type)}</TableCell>
                    <TableCell>{notification.recipient}</TableCell>
                    <TableCell>{new Date(notification.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(notification.status)}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{notification.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm text-muted-foreground">Type</Label>
                              <p>{getTypeBadge(notification.type)}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Message</Label>
                              <p className="mt-1">{notification.message}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Recipient</Label>
                              <p>{notification.recipient}</p>
                            </div>
                            <div className="flex justify-between">
                              <div>
                                <Label className="text-sm text-muted-foreground">Date</Label>
                                <p>{new Date(notification.date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Status</Label>
                                <p>{getStatusBadge(notification.status)}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No notifications found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}