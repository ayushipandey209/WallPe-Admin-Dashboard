import { useState } from 'react';
import { Eye, Filter, Download, Check, X, Search, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { mockListings, type Listing } from '../data/mockData';

export function ListingsManagement() {
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Filter listings based on search and filters
  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || listing.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    
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

  const handleStatusChange = (listingId: string, newStatus: 'approved' | 'denied') => {
    setListings(listings.map(listing => 
      listing.id === listingId ? { ...listing, status: newStatus } : listing
    ));
  };

  const handleBulkAction = (action: 'approve' | 'deny' | 'export') => {
    if (action === 'export') {
      // Mock export functionality
      console.log('Exporting selected listings:', selectedListings);
      return;
    }

    setListings(listings.map(listing => 
      selectedListings.includes(listing.id) 
        ? { ...listing, status: action === 'approve' ? 'approved' : 'denied' }
        : listing
    ));
    setSelectedListings([]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default' as const,
      pending: 'secondary' as const,
      denied: 'destructive' as const
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Listings Management</CardTitle>
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
                <SelectItem value="denied">Denied</SelectItem>
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
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction('deny')}>
                <X className="w-4 h-4 mr-2" />
                Deny
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
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
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
                    <TableCell className="font-mono text-sm">{listing.id}</TableCell>
                    <TableCell>{listing.userName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{listing.location}</TableCell>
                    <TableCell>{getTypeBadge(listing.type)}</TableCell>
                    <TableCell>{getStatusBadge(listing.status)}</TableCell>
                    <TableCell>{formatCurrency(listing.price)}</TableCell>
                    <TableCell>{new Date(listing.dateAdded).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedListing(listing)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Listing Details - {listing.id}</DialogTitle>
                            </DialogHeader>
                            {selectedListing && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm text-muted-foreground">User</label>
                                    <p>{selectedListing.userName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">Type</label>
                                    <p className="capitalize">{selectedListing.type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">Price</label>
                                    <p>{formatCurrency(selectedListing.price)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-muted-foreground">Status</label>
                                    <p className="capitalize">{selectedListing.status}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">Location</label>
                                  <p>{selectedListing.location}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">Description</label>
                                  <p>{selectedListing.description}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">Images</label>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {selectedListing.images.map((image, index) => (
                                      <img
                                        key={index}
                                        src={image}
                                        alt={`Listing ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border"
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                  <Button 
                                    onClick={() => handleStatusChange(selectedListing.id, 'approved')}
                                    disabled={selectedListing.status === 'approved'}
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleStatusChange(selectedListing.id, 'denied')}
                                    disabled={selectedListing.status === 'denied'}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Deny
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
                            <DropdownMenuItem onClick={() => handleStatusChange(listing.id, 'approved')}>
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(listing.id, 'denied')}>
                              Deny
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