import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { AnalyticsService, type TimelineDataPoint, type ListingTypeDataPoint, type UserActivityDataPoint } from '../services/analyticsService';

const chartConfig: ChartConfig = {
  listings: {
    label: 'Listings',
    color: 'hsl(var(--chart-1))',
  },
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-2))',
  },
  users: {
    label: 'Users',
    color: 'hsl(var(--chart-3))',
  },
  campaigns: {
    label: 'Campaigns',
    color: 'hsl(var(--chart-4))',
  },
};

// Extended mock data for analytics
const revenueData = [
  { month: 'Jan', revenue: 45000, target: 50000 },
  { month: 'Feb', revenue: 52000, target: 55000 },
  { month: 'Mar', revenue: 48000, target: 53000 },
  { month: 'Apr', revenue: 61000, target: 58000 },
  { month: 'May', revenue: 55000, target: 60000 },
  { month: 'Jun', revenue: 67000, target: 65000 },
];

const engagementData = [
  { month: 'Jan', views: 12000, clicks: 1200, conversions: 240 },
  { month: 'Feb', views: 14000, clicks: 1400, conversions: 280 },
  { month: 'Mar', views: 13000, clicks: 1300, conversions: 260 },
  { month: 'Apr', views: 16000, clicks: 1600, conversions: 320 },
  { month: 'May', views: 15000, clicks: 1500, conversions: 300 },
  { month: 'Jun', views: 18000, clicks: 1800, conversions: 360 },
];

const locationData = [
  { city: 'Mumbai', listings: 245, fill: 'var(--chart-1)' },
  { city: 'Delhi', listings: 198, fill: 'var(--chart-2)' },
  { city: 'Bangalore', listings: 187, fill: 'var(--chart-3)' },
  { city: 'Chennai', listings: 156, fill: 'var(--chart-4)' },
  { city: 'Kolkata', listings: 134, fill: 'var(--chart-5)' },
  { city: 'Hyderabad', listings: 125, fill: 'var(--chart-1)' },
];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');
  const [reportType, setReportType] = useState('overview');
  const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
  const [typeData, setTypeData] = useState<ListingTypeDataPoint[]>([]);
  const [userActivityData, setUserActivityData] = useState<UserActivityDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Fetch all analytics data in parallel
        const [timeline, type, userActivity] = await Promise.all([
          AnalyticsService.getListingsTimelineData(),
          AnalyticsService.getListingTypeData(),
          AnalyticsService.getUserActivityData()
        ]);
        
        console.log('Fetched analytics data:', { timeline, type, userActivity });
        
        setTimelineData(timeline);
        setTypeData(type);
        setUserActivityData(userActivity);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Fallback to mock data if there's an error
        setTimelineData([
          { month: 'Jan', listings: 45 },
          { month: 'Feb', listings: 52 },
          { month: 'Mar', listings: 48 },
          { month: 'Apr', listings: 61 },
          { month: 'May', listings: 55 },
          { month: 'Jun', listings: 67 }
        ]);
        setTypeData([
          { type: 'Wall', count: 450, fill: 'var(--chart-1)' },
          { type: 'Shop', count: 320, fill: 'var(--chart-2)' },
          { type: 'Vehicle', count: 280, fill: 'var(--chart-3)' },
          { type: 'Land', count: 197, fill: 'var(--chart-4)' }
        ]);
        setUserActivityData([
          { month: 'Jan', newUsers: 23, activeUsers: 142 },
          { month: 'Feb', newUsers: 31, activeUsers: 158 },
          { month: 'Mar', newUsers: 28, activeUsers: 163 },
          { month: 'Apr', newUsers: 45, activeUsers: 180 },
          { month: 'May', newUsers: 38, activeUsers: 195 },
          { month: 'Jun', newUsers: 52, activeUsers: 210 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const handleExportReport = () => {
    // Mock export functionality
    console.log('Exporting report:', { timeRange, reportType });
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics & Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into platform performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="listings">Listings</SelectItem>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹3,48,000</div>
            <p className="text-xs text-green-600">+12.5% from last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Revenue/Listing</CardTitle>
            <Calendar className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹27,880</div>
            <p className="text-xs text-blue-600">+8.2% from last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
            <p className="text-xs text-purple-600">+2.1% from last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
            <MapPin className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mumbai</div>
            <p className="text-xs text-orange-600">245 listings</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue vs targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      `₹${value.toLocaleString()}`, 
                      name === 'revenue' ? 'Revenue' : 'Target'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stackId="1"
                    stroke="var(--chart-3)"
                    fill="var(--chart-3)"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="2"
                    stroke="var(--chart-2)"
                    fill="var(--chart-2)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Views, clicks, and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    name="Clicks"
                  />
                  <Line
                    type="monotone"
                    dataKey="conversions"
                    stroke="var(--chart-3)"
                    strokeWidth={2}
                    name="Conversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Locations</CardTitle>
            <CardDescription>Listings by city</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="listings"
                    label={({ city, listings }) => `${city}: ${listings}`}
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Listing Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Type Performance</CardTitle>
            <CardDescription>Revenue by listing type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData.map(item => ({ ...item, revenue: item.count * 25000 }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Performance metrics by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Listings</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Avg. Price</th>
                  <th className="text-right p-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {typeData.map((item) => (
                  <tr key={item.type} className="border-b">
                    <td className="p-2 font-medium capitalize">{item.type}</td>
                    <td className="p-2 text-right">{item.count}</td>
                    <td className="p-2 text-right">₹{(item.count * 25000).toLocaleString()}</td>
                    <td className="p-2 text-right">₹{25000}</td>
                    <td className="p-2 text-right text-green-600">+{(Math.random() * 20).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}