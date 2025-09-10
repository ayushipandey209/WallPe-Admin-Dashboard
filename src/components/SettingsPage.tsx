import { useState } from 'react';
import { Settings, Plus, Trash2, Edit, Users, Bell, Palette, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  listingsCount: number;
}

interface AdminRole {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  lastActive: string;
}

export function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Wall Advertisement', description: 'Outdoor wall spaces for advertising', isActive: true, listingsCount: 450 },
    { id: '2', name: 'Shop Front', description: 'Shop front advertising spaces', isActive: true, listingsCount: 320 },
    { id: '3', name: 'Vehicle Advertisement', description: 'Mobile advertising on vehicles', isActive: true, listingsCount: 280 },
    { id: '4', name: 'Land Billboard', description: 'Large billboard spaces on land', isActive: true, listingsCount: 197 },
    { id: '5', name: 'Digital Display', description: 'Digital advertising displays', isActive: false, listingsCount: 0 },
  ]);

  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([
    { 
      id: '1', 
      name: 'Admin User', 
      email: 'admin@wallpe.com', 
      role: 'super_admin',
      permissions: ['all'],
      lastActive: '2024-01-26'
    },
    { 
      id: '2', 
      name: 'John Manager', 
      email: 'john@wallpe.com', 
      role: 'admin',
      permissions: ['listings', 'users', 'approvals'],
      lastActive: '2024-01-25'
    },
    { 
      id: '3', 
      name: 'Sarah Moderator', 
      email: 'sarah@wallpe.com', 
      role: 'moderator',
      permissions: ['approvals', 'notifications'],
      lastActive: '2024-01-24'
    },
  ]);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [platformSettings, setPlatformSettings] = useState({
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    language: 'en',
    maintenanceMode: false,
    userRegistration: true,
    autoApproval: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [notificationTemplates, setNotificationTemplates] = useState({
    welcome: 'Welcome to WallPe! Your account has been created successfully.',
    approval: 'Your listing has been approved and is now live on our platform.',
    rejection: 'Your listing has been rejected. Please review our guidelines and resubmit.',
    payment: 'Payment received for your campaign. Thank you for choosing WallPe.',
  });

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.description) return;
    
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description,
      isActive: true,
      listingsCount: 0
    };
    
    setCategories([...categories, category]);
    setNewCategory({ name: '', description: '' });
  };

  const handleToggleCategory = (id: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      moderator: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Platform Settings
          </CardTitle>
          <CardDescription>Configure general platform preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={platformSettings.currency} onValueChange={(value) => 
                setPlatformSettings({...platformSettings, currency: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={platformSettings.timezone} onValueChange={(value) => 
                setPlatformSettings({...platformSettings, timezone: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Default Language</Label>
              <Select value={platformSettings.language} onValueChange={(value) => 
                setPlatformSettings({...platformSettings, language: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">System Controls</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable user access</p>
                </div>
                <Switch 
                  checked={platformSettings.maintenanceMode}
                  onCheckedChange={(checked) => 
                    setPlatformSettings({...platformSettings, maintenanceMode: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                </div>
                <Switch 
                  checked={platformSettings.userRegistration}
                  onCheckedChange={(checked) => 
                    setPlatformSettings({...platformSettings, userRegistration: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Approval</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve listings</p>
                </div>
                <Switch 
                  checked={platformSettings.autoApproval}
                  onCheckedChange={(checked) => 
                    setPlatformSettings({...platformSettings, autoApproval: checked})
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                </div>
                <Switch 
                  checked={platformSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setPlatformSettings({...platformSettings, emailNotifications: checked})
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listing Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Listing Categories
          </CardTitle>
          <CardDescription>Manage advertisement types and categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Category */}
          <div className="flex gap-2">
            <Input
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            />
            <Input
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
            />
            <Button onClick={handleAddCategory}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Categories List */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category.listingsCount}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleCategory(category.id)}
                        >
                          {category.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={category.listingsCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Roles & Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Roles & Permissions
          </CardTitle>
          <CardDescription>Manage admin users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminRoles.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(admin.role)}>
                        {admin.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {admin.permissions.slice(0, 2).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {admin.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{admin.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(admin.lastActive).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Notification Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Templates
          </CardTitle>
          <CardDescription>Customize automated notification messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {Object.entries(notificationTemplates).map(([key, template]) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize">{key.replace('_', ' ')} Message</Label>
                <Textarea
                  value={template}
                  onChange={(e) => setNotificationTemplates({
                    ...notificationTemplates,
                    [key]: e.target.value
                  })}
                  rows={2}
                />
              </div>
            ))}
          </div>
          <Button className="w-full">
            Save Templates
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}