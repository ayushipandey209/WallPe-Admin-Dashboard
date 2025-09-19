import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Eye, Calendar, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { mockKPIs, listingsTimelineData, listingTypeData, userActivityData, mockListings } from '../data/mockData';
import { ListingService } from '../services/listingService';

const chartConfig: ChartConfig = {
  listings: {
    label: 'Listings',
    color: 'hsl(var(--chart-1))',
  },
  newUsers: {
    label: 'New Users',
    color: 'hsl(var(--chart-2))',
  },
  activeUsers: {
    label: 'Active Users',
    color: 'hsl(var(--chart-3))',
  },
};

export function DashboardOverview() {
  const [listingStats, setListingStats] = useState<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const stats = await ListingService.getListingStats();
        setListingStats(stats);
      } catch (error) {
        console.error('Error fetching listing stats:', error);
        // Fallback to mock data if there's an error
        setListingStats({
          total: mockKPIs[0].value,
          byType: { wall: 450, shop: 320, vehicle: 280, land: 197 },
          byStatus: { pending: mockKPIs[1].value, approved: 1000, rejected: 50 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const recentActivity = mockListings.slice(0, 5).map(listing => ({
    ...listing,
    timeAgo: '2 hours ago' // Mock time
  }));

  // Create real KPIs from database data
  const realKPIs = listingStats ? [
    { 
      label: 'Total Listings', 
      value: listingStats.total, 
      change: 12.5, 
      trend: 'up' as const 
    },
    { 
      label: 'Pending Approvals', 
      value: listingStats.byStatus.pending || 0, 
      change: -8.2, 
      trend: 'down' as const 
    },
    { 
      label: 'Active Campaigns', 
      value: listingStats.byStatus.approved || 0, 
      change: 15.3, 
      trend: 'up' as const 
    },
    { 
      label: 'Monthly Revenue', 
      value: 45650, 
      change: 23.7, 
      trend: 'up' as const 
    }
  ] : mockKPIs;

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {realKPIs.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
              {getTrendIcon(kpi.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  kpi.label.includes('Revenue') ? formatCurrency(kpi.value) : kpi.value.toLocaleString()
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={kpi.change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </span>
                {' '}from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Listings Timeline</CardTitle>
            <CardDescription>Monthly listing submissions over the year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={listingsTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="listings"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-1)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Listing Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Listing Type Distribution</CardTitle>
            <CardDescription>Breakdown by advertisement type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={listingStats ? Object.entries(listingStats.byType).map(([type, count], index) => ({
                      type: type.charAt(0).toUpperCase() + type.slice(1),
                      count,
                      fill: listingTypeData[index]?.fill || `var(--chart-${(index % 4) + 1})`
                    })) : listingTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ type, count }) => `${type}: ${count}`}
                  >
                    {(listingStats ? Object.entries(listingStats.byType).map(([type, count], index) => ({
                      type: type.charAt(0).toUpperCase() + type.slice(1),
                      count,
                      fill: listingTypeData[index]?.fill || `var(--chart-${(index % 4) + 1})`
                    })) : listingTypeData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Activity and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity Trends</CardTitle>
            <CardDescription>New vs Active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="newUsers" fill="var(--chart-2)" name="New Users" />
                  <Bar dataKey="activeUsers" fill="var(--chart-3)" name="Active Users" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest listings and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {activity.type === 'wall' && <MapPin className="w-4 h-4" />}
                      {activity.type === 'shop' && <Eye className="w-4 h-4" />}
                      {activity.type === 'vehicle' && <Calendar className="w-4 h-4" />}
                      {activity.type === 'land' && <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {activity.type} listing - {activity.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        activity.status === 'approved' ? 'default' : 
                        activity.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}