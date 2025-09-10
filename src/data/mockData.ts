// Mock data for WallPe Admin Dashboard

export interface Listing {
  id: string;
  userId: string;
  userName: string;
  location: string;
  type: 'wall' | 'shop' | 'vehicle' | 'land';
  status: 'pending' | 'approved' | 'denied';
  price: number;
  dateAdded: string;
  description: string;
  images: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalListings: number;
  activeCampaigns: number;
  joinDate: string;
  status: 'active' | 'suspended' | 'pending';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  status: 'sent' | 'scheduled' | 'pending';
  recipient: string;
}

export interface KPI {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

// Mock KPIs
export const mockKPIs: KPI[] = [
  { label: 'Total Listings', value: 1247, change: 12.5, trend: 'up' },
  { label: 'Pending Approvals', value: 23, change: -8.2, trend: 'down' },
  { label: 'Active Campaigns', value: 89, change: 15.3, trend: 'up' },
  { label: 'Monthly Revenue', value: 45650, change: 23.7, trend: 'up' },
];

// Mock Listings
export const mockListings: Listing[] = [
  {
    id: 'WP-2024-001',
    userId: 'user-001',
    userName: 'John Smith',
    location: 'Mumbai Central, Maharashtra',
    type: 'wall',
    status: 'approved',
    price: 25000,
    dateAdded: '2024-01-15',
    description: 'Prime wall space near railway station',
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400']
  },
  {
    id: 'WP-2024-002',
    userId: 'user-002',
    userName: 'Priya Patel',
    location: 'Connaught Place, Delhi',
    type: 'shop',
    status: 'pending',
    price: 45000,
    dateAdded: '2024-01-18',
    description: 'Shop front in busy commercial area',
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400']
  },
  {
    id: 'WP-2024-003',
    userId: 'user-003',
    userName: 'Raj Kumar',
    location: 'Koramangala, Bangalore',
    type: 'vehicle',
    status: 'approved',
    price: 15000,
    dateAdded: '2024-01-20',
    description: 'Auto rickshaw advertising space',
    images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400']
  },
  {
    id: 'WP-2024-004',
    userId: 'user-004',
    userName: 'Sunita Sharma',
    location: 'Park Street, Kolkata',
    type: 'land',
    status: 'pending',
    price: 35000,
    dateAdded: '2024-01-22',
    description: 'Billboard space on prime land',
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400']
  },
  {
    id: 'WP-2024-005',
    userId: 'user-005',
    userName: 'Ahmed Khan',
    location: 'Marine Drive, Mumbai',
    type: 'wall',
    status: 'denied',
    price: 55000,
    dateAdded: '2024-01-25',
    description: 'Sea-facing wall advertisement',
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400']
  }
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+91 98765 43210',
    totalListings: 5,
    activeCampaigns: 3,
    joinDate: '2023-06-15',
    status: 'active'
  },
  {
    id: 'user-002',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '+91 98765 43211',
    totalListings: 8,
    activeCampaigns: 5,
    joinDate: '2023-08-22',
    status: 'active'
  },
  {
    id: 'user-003',
    name: 'Raj Kumar',
    email: 'raj.kumar@email.com',
    phone: '+91 98765 43212',
    totalListings: 3,
    activeCampaigns: 2,
    joinDate: '2023-12-10',
    status: 'active'
  },
  {
    id: 'user-004',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@email.com',
    phone: '+91 98765 43213',
    totalListings: 12,
    activeCampaigns: 8,
    joinDate: '2023-04-05',
    status: 'suspended'
  },
  {
    id: 'user-005',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@email.com',
    phone: '+91 98765 43214',
    totalListings: 2,
    activeCampaigns: 0,
    joinDate: '2024-01-20',
    status: 'pending'
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    title: 'Listing Approved',
    message: 'Your wall advertisement listing has been approved',
    type: 'success',
    date: '2024-01-25',
    status: 'sent',
    recipient: 'John Smith'
  },
  {
    id: 'notif-002',
    title: 'Payment Reminder',
    message: 'Payment due for your active campaign',
    type: 'warning',
    date: '2024-01-26',
    status: 'scheduled',
    recipient: 'Priya Patel'
  },
  {
    id: 'notif-003',
    title: 'Account Suspended',
    message: 'Your account has been temporarily suspended',
    type: 'error',
    date: '2024-01-24',
    status: 'sent',
    recipient: 'Sunita Sharma'
  }
];

// Chart data
export const listingsTimelineData = [
  { month: 'Jan', listings: 45 },
  { month: 'Feb', listings: 52 },
  { month: 'Mar', listings: 48 },
  { month: 'Apr', listings: 61 },
  { month: 'May', listings: 55 },
  { month: 'Jun', listings: 67 },
  { month: 'Jul', listings: 73 },
  { month: 'Aug', listings: 69 },
  { month: 'Sep', listings: 82 },
  { month: 'Oct', listings: 78 },
  { month: 'Nov', listings: 85 },
  { month: 'Dec', listings: 91 }
];

export const listingTypeData = [
  { type: 'Wall', count: 450, fill: 'var(--chart-1)' },
  { type: 'Shop', count: 320, fill: 'var(--chart-2)' },
  { type: 'Vehicle', count: 280, fill: 'var(--chart-3)' },
  { type: 'Land', count: 197, fill: 'var(--chart-4)' }
];

export const userActivityData = [
  { month: 'Jan', newUsers: 23, activeUsers: 142 },
  { month: 'Feb', newUsers: 31, activeUsers: 158 },
  { month: 'Mar', newUsers: 28, activeUsers: 163 },
  { month: 'Apr', newUsers: 45, activeUsers: 180 },
  { month: 'May', newUsers: 38, activeUsers: 195 },
  { month: 'Jun', newUsers: 52, activeUsers: 210 }
];