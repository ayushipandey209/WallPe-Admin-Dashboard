import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter, Download, Check, X, Search, MoreHorizontal, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ListingService, type ListingWithDetails } from '../services/listingService';
import { mockListings } from '../data/mockData';

export function ListingsManagement() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Fetch listings on component mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('=== ATTEMPTING TO FETCH FROM DATABASE ===');
        const data = await ListingService.getAllListings();
        console.log('Database fetch successful, got', data.length, 'listings');
        console.log('First listing data:', data[0]);
        setListings(data);
        setUsingMockData(false);
      } catch (err) {
        console.error('Error fetching listings from database:', err);
        console.log('Falling back to mock data...');
        
        // Convert mock data to the expected format
        const mockDataAsListings: ListingWithDetails[] = mockListings.map(mock => ({
          id: mock.id,
          name: mock.description,
          phone_number: '+1234567890', // Default phone
          profile_id: mock.userId,
          length_ft: 10,
          width_ft: 8,
          created_at: mock.dateAdded,
          address_id: null,
          type: mock.type,
          notes: mock.description,
          location: null,
          length_in: 120,
          width_in: 96,
          list_status: mock.status === 'denied' ? 'rejected' : mock.status,
          media: mock.images.map((url, index) => ({
            id: `mock-media-${index}`,
            created_at: new Date().toISOString(),
            space_id: mock.id,
            type: 'image',
            url: url,
            metadata: null
          }))
        }));
        
        setListings(mockDataAsListings);
        setUsingMockData(true);
        setError('Using demo data - database connection failed');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter listings based on search and filters
  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.address?.city && listing.address.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (listing.address?.district && listing.address.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (listing.notes && listing.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || listing.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || listing.list_status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(filteredListings.map(listing => listing.id));
    } else {
      setSelectedListings([]);
    }
  };

  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      setSelectedListings([...selectedListings, listingId]);
    } else {
      setSelectedListings(selectedListings.filter(id => id !== listingId));
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await ListingService.updateListingStatus(listingId, newStatus);
      setListings(listings.map(listing => 
        listing.id === listingId ? { ...listing, list_status: newStatus } : listing
      ));
    } catch (err) {
      console.error('Error updating listing status:', err);
      setError('Failed to update listing status. Please try again.');
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'export') => {
    if (action === 'export') {
      // Mock export functionality
      console.log('Exporting selected listings:', selectedListings);
      return;
    }

    try {
      // Update all selected listings
      const updatePromises = selectedListings.map(id => 
        ListingService.updateListingStatus(id, action === 'approve' ? 'approved' : 'rejected')
      );
      await Promise.all(updatePromises);

      setListings(listings.map(listing => 
        selectedListings.includes(listing.id) 
          ? { ...listing, list_status: action === 'approve' ? 'approved' : 'rejected' }
          : listing
      ));
      setSelectedListings([]);
    } catch (err) {
      console.error('Error updating bulk status:', err);
      setError('Failed to update listing statuses. Please try again.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default' as const,
      pending: 'secondary' as const,
      rejected: 'destructive' as const
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      wall: 'bg-blue-100 text-blue-800',
      shop: 'bg-green-100 text-green-800',
      vehicle: 'bg-purple-100 text-purple-800',
      land: 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Listings Management</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading listings...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Listings Management</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Listings Management</CardTitle>
          <div className="mt-4">
            <Button 
              onClick={() => navigate('/listings/test-listing-id')}
              variant="outline"
              size="sm"
            >
              Test Details Screen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, user, or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="wall">Wall</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedListings.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
              <span className="text-sm">{selectedListings.length} selected</span>
              <Button size="sm" onClick={() => handleBulkAction('approve')}>
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction('reject')}>
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Listing ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedListings.includes(listing.id)}
                        onCheckedChange={(checked) => handleSelectListing(listing.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{listing.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-medium">{listing.name}</TableCell>
                    <TableCell>{listing.profile?.name || 'Unknown'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {listing.address ? 
                        `${listing.address.city || ''}, ${listing.address.district || ''}`.trim() || 
                        `${listing.address.village || ''}, ${listing.address.state || ''}`.trim() || 
                        'No location' 
                        : 'No address'
                      }
                    </TableCell>
                    <TableCell>{getTypeBadge(listing.type)}</TableCell>
                    <TableCell>{getStatusBadge(listing.list_status || 'pending')}</TableCell>
                    <TableCell>
                      {listing.length_ft && listing.width_ft ? 
                        `${listing.length_ft}ft × ${listing.width_ft}ft` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>{listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            console.log('=== EYE BUTTON CLICKED ===');
                            console.log('Listing ID:', listing.id);
                            console.log('Listing ID type:', typeof listing.id);
                            console.log('Full listing data:', listing);
                            console.log('Media count:', listing.media?.length || 0);
                            console.log('Media data:', listing.media);
                            console.log('Using mock data:', usingMockData);
                            console.log('Navigating to:', `/listings/${listing.id}`);
                            
                            // Store the listing data in sessionStorage so details screen can access it
                            sessionStorage.setItem('currentListing', JSON.stringify(listing));
                            sessionStorage.setItem('usingMockData', JSON.stringify(usingMockData));
                            
                            navigate(`/listings/${listing.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/listings/${listing.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(listing.id, 'approved')}>
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(listing.id, 'rejected')}>
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem>Send Notification</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No listings found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}