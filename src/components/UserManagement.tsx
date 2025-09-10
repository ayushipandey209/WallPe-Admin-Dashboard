import { useState } from 'react';
import { Search, UserX, UserCheck, Send, Eye, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { mockUsers, mockListings, type User } from '../data/mockData';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (userId: string, newStatus: 'active' | 'suspended' | 'pending') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default' as const,
      pending: 'secondary' as const,
      suspended: 'destructive' as const
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getUserListings = (userId: string) => {
    return mockListings.filter(listing => listing.userId === userId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Listings</TableHead>
                  <TableHead>Active Campaigns</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&facepad=2&random=${user.id}`} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{user.totalListings}</TableCell>
                    <TableCell className="text-center">{user.activeCampaigns}</TableCell>
                    <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>User Profile - {user.name}</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                {/* User Basic Info */}
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&facepad=2&random=${selectedUser.id}`} />
                                    <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                                    <p className="text-muted-foreground">{selectedUser.email}</p>
                                    <p className="text-muted-foreground">{selectedUser.phone}</p>
                                  </div>
                                </div>

                                {/* User Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                  <Card>
                                    <CardContent className="pt-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold">{selectedUser.totalListings}</div>
                                        <p className="text-xs text-muted-foreground">Total Listings</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="pt-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold">{selectedUser.activeCampaigns}</div>
                                        <p className="text-xs text-muted-foreground">Active Campaigns</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="pt-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold">{new Date(selectedUser.joinDate).getFullYear()}</div>
                                        <p className="text-xs text-muted-foreground">Member Since</p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* User Listings */}
                                <div>
                                  <h4 className="font-medium mb-3">User Listings</h4>
                                  <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {getUserListings(selectedUser.id).map((listing) => (
                                      <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                          <p className="font-medium">{listing.id}</p>
                                          <p className="text-sm text-muted-foreground">{listing.location}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Badge className="capitalize">{listing.type}</Badge>
                                          <Badge
                                            variant={
                                              listing.status === 'approved' ? 'default' :
                                              listing.status === 'pending' ? 'secondary' :
                                              'destructive'
                                            }
                                          >
                                            {listing.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                    {getUserListings(selectedUser.id).length === 0 && (
                                      <p className="text-center text-muted-foreground py-4">No listings found</p>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t">
                                  <Button 
                                    onClick={() => handleStatusChange(selectedUser.id, 'active')}
                                    disabled={selectedUser.status === 'active'}
                                  >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Activate
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                                    disabled={selectedUser.status === 'suspended'}
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Suspend
                                  </Button>
                                  <Button variant="outline">
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Message
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')}>
                              Activate User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'suspended')}>
                              Suspend User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Send Notification
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Verify User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}