import { useState } from 'react';
import { Check, X, Eye, MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { mockListings, type Listing } from '../data/mockData';

export function ApprovalsPage() {
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [approvalReason, setApprovalReason] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Get only pending listings
  const pendingListings = listings.filter(listing => listing.status === 'pending');

  const handleApproval = (listingId: string, status: 'approved' | 'denied', reason?: string) => {
    setListings(listings.map(listing => 
      listing.id === listingId 
        ? { ...listing, status, approvalReason: reason }
        : listing
    ));
    
    // Remove from selected if it was selected
    setSelectedListings(prev => prev.filter(id => id !== listingId));
  };

  const handleBulkApproval = (status: 'approved' | 'denied') => {
    if (selectedListings.length === 0) return;

    setListings(listings.map(listing => 
      selectedListings.includes(listing.id)
        ? { ...listing, status, approvalReason: approvalReason || `Bulk ${status}` }
        : listing
    ));
    
    setSelectedListings([]);
    setApprovalReason('');
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
      setSelectedListings(pendingListings.map(listing => listing.id));
    } else {
      setSelectedListings([]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
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

  return (
    <div className="space-y-6">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Pending Approvals</h2>
          <p className="text-muted-foreground">
            {pendingListings.length} listings waiting for approval
          </p>
        </div>
        
        {selectedListings.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedListings.length} selected
            </span>
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
        )}
      </div>

      {/* Bulk approval reason */}
      {selectedListings.length > 0 && (
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

      {/* Listings Grid */}
      {pendingListings.length > 0 ? (
        <>
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="select-all"
              checked={selectedListings.length === pendingListings.length}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm">
              Select all ({pendingListings.length})
            </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingListings.map((listing) => (
              <Card key={listing.id} className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    checked={selectedListings.includes(listing.id)}
                    onCheckedChange={(checked) => handleSelectListing(listing.id, checked as boolean)}
                  />
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(listing.type)}
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
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
                          <DialogTitle>Listing Review - {listing.id}</DialogTitle>
                        </DialogHeader>
                        {selectedListing && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm text-muted-foreground">User</Label>
                                <p>{selectedListing.userName}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Type</Label>
                                <p className="capitalize">{selectedListing.type}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Price</Label>
                                <p>{formatCurrency(selectedListing.price)}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Date Submitted</Label>
                                <p>{new Date(selectedListing.dateAdded).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Location</Label>
                              <p>{selectedListing.location}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Description</Label>
                              <p>{selectedListing.description}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Images</Label>
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
                                onClick={() => handleApproval(selectedListing.id, 'denied', approvalReason)}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Deny
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{listing.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{listing.userName}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Listing Image */}
                  <div className="aspect-video relative overflow-hidden rounded-lg border">
                    <img
                      src={listing.images[0]}
                      alt="Listing preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Listing Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-medium">{formatCurrency(listing.price)}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm text-right max-w-[200px]">{listing.location}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Description</span>
                      <p className="text-sm mt-1 line-clamp-2">{listing.description}</p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex gap-2 pt-2">
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
                      onClick={() => handleApproval(listing.id, 'denied')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Deny
                    </Button>
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
            <Check className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground text-center">
              There are no pending listings waiting for approval.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}