import { useState, useEffect } from 'react';
import { Check, X, Eye, MessageSquare, Clock, CheckCircle, XCircle, Loader2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ListingService, type ListingWithDetails } from '../services/listingService';

export function ApprovalsPage() {
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [approvalReason, setApprovalReason] = useState('');
  const [selectedListing, setSelectedListing] = useState<ListingWithDetails | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch listings from database
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ListingService.getAllListings();
        setListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to fetch listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter listings based on active filter and status filter
  const getFilteredListings = () => {
    let filtered = listings;

    // Apply status filter first
    if (statusFilter !== 'all') {
      filtered = filtered.filter(listing => listing.list_status === statusFilter);
    }

    // Then apply tab filter
    switch (activeFilter) {
      case 'pending':
        return filtered.filter(listing => listing.list_status === 'pending');
      case 'approved':
        return filtered.filter(listing => listing.list_status === 'approved');
      case 'denied':
        return filtered.filter(listing => listing.list_status === 'rejected');
      default:
        return filtered;
    }
  };

  const filteredListings = getFilteredListings();

  const handleApproval = async (listingId: string, status: 'approved' | 'rejected' | 'pending', reason?: string) => {
    try {
      if (status === 'approved' || status === 'rejected') {
        await ListingService.updateListingStatus(listingId, status);
      }
      
      // Update local state
      setListings(listings.map(listing => 
        listing.id === listingId 
          ? { ...listing, list_status: status }
          : listing
      ));
      
      // Remove from selected if it was selected
      setSelectedListings(prev => prev.filter(id => id !== listingId));
    } catch (error) {
      console.error('Error updating listing status:', error);
      setError('Failed to update listing status. Please try again.');
    }
  };

  const handleBulkApproval = async (status: 'approved' | 'rejected') => {
    if (selectedListings.length === 0) return;

    try {
      // Update each listing in the database
      await Promise.all(
        selectedListings.map(id => ListingService.updateListingStatus(id, status))
      );

      // Update local state
      setListings(listings.map(listing => 
        selectedListings.includes(listing.id)
          ? { ...listing, list_status: status }
          : listing
      ));
      
      setSelectedListings([]);
      setApprovalReason('');
    } catch (error) {
      console.error('Error updating bulk listing status:', error);
      setError('Failed to update listing statuses. Please try again.');
    }
  };

  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      setSelectedListings([...selectedListings, listingId]);
    } else {
      setSelectedListings(selectedListings.filter(id => id !== listingId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(filteredListings.map(listing => listing.id));
    } else {
      setSelectedListings([]);
    }
  };


  const getTypeBadge = (type: string) => {
    const colors = {
      wall: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      shop: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      vehicle: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      land: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      pending: { 
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: <Clock className="w-3 h-3" />,
        text: 'Pending'
      },
      approved: { 
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'Approved'
      },
      rejected: { 
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: <XCircle className="w-3 h-3" />,
        text: 'Rejected'
      }
    };
    
    const actualStatus = status || 'pending';
    const config = statusConfig[actualStatus as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.className} variant="secondary">
        {config.icon}
        <span className="ml-1">{config.text}</span>
      </Badge>
    );
  };

  const getFilterCounts = () => {
    // First apply status filter
    let baseListings = listings;
    if (statusFilter !== 'all') {
      baseListings = listings.filter(l => l.list_status === statusFilter);
    }

    return {
      all: baseListings.length,
      pending: baseListings.filter(l => l.list_status === 'pending').length,
      approved: baseListings.filter(l => l.list_status === 'approved').length,
      denied: baseListings.filter(l => l.list_status === 'rejected').length
    };
  };

  const counts = getFilterCounts();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-muted-foreground">Loading listings...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Listing Approvals</h2>
          <p className="text-muted-foreground">
            Manage all listing approvals and reviews
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Listings</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Listing Approvals</h2>
          <p className="text-muted-foreground">
            Manage all listing approvals and reviews
          </p>
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${statusFilter !== 'all' ? 'text-blue-600' : 'text-muted-foreground'}`} />
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className={`w-40 ${statusFilter !== 'all' ? 'border-blue-300 bg-blue-50' : ''}`}>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending Only</SelectItem>
              <SelectItem value="approved">Approved Only</SelectItem>
              <SelectItem value="rejected">Rejected Only</SelectItem>
            </SelectContent>
          </Select>
          {statusFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Indicator */}
      {(statusFilter !== 'all') && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Showing: <span className="font-medium capitalize">{statusFilter}</span> listings only
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter('all')}
            className="ml-auto text-blue-600 hover:text-blue-800"
          >
            Clear Filter
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
            <Badge variant="secondary" className="ml-1 text-xs">
              {counts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
            <Badge variant="secondary" className="ml-1 text-xs">
              {counts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved
            <Badge variant="secondary" className="ml-1 text-xs">
              {counts.approved}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="denied" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected
            <Badge variant="secondary" className="ml-1 text-xs">
              {counts.denied}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Bulk Actions - Only show for pending listings */}
        {activeFilter === 'pending' && selectedListings.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              {selectedListings.length} selected
            </span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={() => handleBulkApproval('approved')}
              >
                <Check className="w-4 h-4 mr-2" />
                Bulk Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => handleBulkApproval('denied')}
              >
                <X className="w-4 h-4 mr-2" />
                Bulk Deny
              </Button>
            </div>
          </div>
        )}

        {/* Bulk approval reason - Only for pending */}
        {activeFilter === 'pending' && selectedListings.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="approval-reason">Bulk Action Reason (Optional)</Label>
                <Textarea
                  id="approval-reason"
                  placeholder="Enter reason for bulk approval/denial..."
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content for each tab */}
        <TabsContent value={activeFilter} className="space-y-4">
          {/* Listings Grid */}
          {filteredListings.length > 0 ? (
            <>
              {/* Select All - Only for pending */}
              {activeFilter === 'pending' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Select all ({filteredListings.length})
                  </Label>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
              <Card key={listing.id} className="relative">
                {/* Checkbox - Only for pending listings */}
                {activeFilter === 'pending' && (
                  <div className="absolute top-4 left-4 z-10">
                    <Checkbox
                      checked={selectedListings.includes(listing.id)}
                      onCheckedChange={(checked) => handleSelectListing(listing.id, checked as boolean)}
                    />
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(listing.type)}
                      {getStatusBadge(listing.status)}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setSelectedListing(listing)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Listing Review - {listing.name}</DialogTitle>
                        </DialogHeader>
                        {selectedListing && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm text-muted-foreground">User</Label>
                                <p>{selectedListing.profile?.name || 'Unknown User'}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Type</Label>
                                <p className="capitalize">{selectedListing.type}</p>
                              </div>
                              {selectedListing.length_ft && selectedListing.width_ft && (
                                <div>
                                  <Label className="text-sm text-muted-foreground">Dimensions</Label>
                                  <p>{selectedListing.length_ft}' × {selectedListing.width_ft}'</p>
                                </div>
                              )}
                              <div>
                                <Label className="text-sm text-muted-foreground">Date Submitted</Label>
                                <p>{new Date(selectedListing.created_at || '').toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Location</Label>
                              <p>
                                {selectedListing.address ? 
                                  `${selectedListing.address.address_line1 || ''} ${selectedListing.address.city || ''}`.trim() || 
                                  `${selectedListing.address.district || ''}, ${selectedListing.address.state || ''}`.trim() :
                                  'Location not specified'
                                }
                              </p>
                            </div>
                            {selectedListing.notes && (
                              <div>
                                <Label className="text-sm text-muted-foreground">Notes</Label>
                                <p>{selectedListing.notes}</p>
                              </div>
                            )}
                            {selectedListing.media && selectedListing.media.length > 0 && (
                              <div>
                                <Label className="text-sm text-muted-foreground">Images</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {selectedListing.media.map((media, index) => (
                                    <img
                                      key={index}
                                      src={media.url}
                                      alt={`Listing ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label htmlFor="decision-reason">Approval/Denial Reason</Label>
                              <Textarea
                                id="decision-reason"
                                placeholder="Enter reason for your decision..."
                                value={approvalReason}
                                onChange={(e) => setApprovalReason(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2 pt-4">
                              {selectedListing.list_status === 'pending' ? (
                                <>
                                  <Button 
                                    className="flex-1"
                                    onClick={() => handleApproval(selectedListing.id, 'approved', approvalReason)}
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => handleApproval(selectedListing.id, 'rejected', approvalReason)}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Deny
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => handleApproval(selectedListing.id, 'pending', approvalReason)}
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Re-review
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{listing.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{listing.profile?.name || 'Unknown User'}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Listing Image */}
                  <div className="aspect-video relative overflow-hidden rounded-lg border">
                    {listing.media && listing.media.length > 0 ? (
                      <img
                        src={listing.media[0].url}
                        alt="Listing preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Listing Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{listing.type}</span>
                    </div>
                    {listing.length_ft && listing.width_ft && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Dimensions</span>
                        <span className="font-medium">{listing.length_ft}' × {listing.width_ft}'</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm text-right max-w-[200px]">
                        {listing.address ? 
                          `${listing.address.address_line1 || ''} ${listing.address.city || ''}`.trim() || 
                          `${listing.address.district || ''}, ${listing.address.state || ''}`.trim() :
                          'Location not specified'
                        }
                      </span>
                    </div>
                    {listing.notes && (
                      <div>
                        <span className="text-sm text-muted-foreground">Notes</span>
                        <p className="text-sm mt-1 line-clamp-2">{listing.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {listing.list_status === 'pending' ? (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleApproval(listing.id, 'approved')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleApproval(listing.id, 'rejected')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Deny
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleApproval(listing.id, 'pending')}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Re-review
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {activeFilter === 'pending' ? (
                  <>
                    <Check className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                    <p className="text-muted-foreground text-center">
                      There are no pending listings waiting for approval.
                    </p>
                  </>
                ) : activeFilter === 'approved' ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No approved listings</h3>
                    <p className="text-muted-foreground text-center">
                      There are no approved listings to display.
                    </p>
                  </>
                ) : activeFilter === 'denied' ? (
                  <>
                    <XCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No rejected listings</h3>
                    <p className="text-muted-foreground text-center">
                      There are no rejected listings to display.
                    </p>
                  </>
                ) : (
                  <>
                    <Clock className="w-12 h-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No listings found</h3>
                    <p className="text-muted-foreground text-center">
                      There are no listings to display.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}