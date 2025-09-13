import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, MapPin, User, Calendar, Phone, Ruler, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ListingService, type ListingWithDetails } from '../services/listingService';
import { supabase } from '../services/supabase';
import { useNavigate, useParams } from 'react-router-dom';

export function ListingDetailsScreen() {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Extract ID from URL pathname as fallback if useParams fails
  const getSpaceId = () => {
    if (paramId) {
      console.log('Using ID from useParams:', paramId);
      return paramId;
    }
    
    // Fallback: extract ID from URL pathname
    const pathname = window.location.pathname;
    const pathParts = pathname.split('/');
    const extractedId = pathParts[pathParts.length - 1];
    
    console.log('useParams failed, extracting from URL pathname:', pathname);
    console.log('Extracted ID from pathname:', extractedId);
    
    // Validate that it looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(extractedId)) {
      console.log('Extracted ID is a valid UUID format');
      return extractedId;
    } else {
      console.error('Extracted ID is not a valid UUID format:', extractedId);
      return null;
    }
  };

  const id = getSpaceId();

  console.log('=== LISTING DETAILS SCREEN DEBUG ===');
  console.log('ListingDetailsScreen rendered with ID:', id);
  console.log('Current URL:', window.location.href);
  console.log('Space ID type:', typeof id);
  console.log('URL pathname:', window.location.pathname);
  console.log('URL search params:', window.location.search);
  console.log('useParams result:', { paramId });
  console.log('Final ID being used:', id);

  useEffect(() => {
    const fetchListing = async () => {
      console.log('useEffect triggered with ID:', id);
      
      if (!id) {
        console.log('No valid ID found in URL params or pathname');
        setError('No valid listing ID provided in URL');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Check if we have data in sessionStorage (from mock data)
        const storedListing = sessionStorage.getItem('currentListing');
        const usingMockData = sessionStorage.getItem('usingMockData') === 'true';
        
        if (storedListing && usingMockData) {
          console.log('Using stored mock data for ID:', id);
          const listingData = JSON.parse(storedListing);
          if (listingData.id === id) {
            console.log('Found matching mock data:', listingData);
            setListing(listingData);
            setLoading(false);
            return;
          }
        }
        
        console.log('Fetching real data from database for space ID:', id);
        
        // Fetch the specific listing with all related data using the ListingService
        const listingData = await ListingService.getListingById(id);
        
        if (listingData) {
          console.log('Successfully fetched real listing data:', listingData);
          setListing(listingData);
        } else {
          console.error('No listing found in database for ID:', id);
          setError('Listing not found in database');
        }
      } catch (err) {
        console.error('Error fetching listing from database:', err);
        setError(`Failed to fetch listing details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    if (!listing) return;

    try {
      setActionLoading(true);
      await ListingService.updateListingStatus(listing.id, newStatus);
      setListing({ ...listing, list_status: newStatus });
    } catch (err) {
      console.error('Error updating listing status:', err);
      setError('Failed to update listing status. Please try again.');
    } finally {
      setActionLoading(false);
    }
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

  const formatAddress = (address: any) => {
    if (!address) return 'No address provided';
    
    const parts = [
      address.address_line1,
      address.address_line2,
      address.village,
      address.city,
      address.district,
      address.state,
      address.pincode?.toString()
    ].filter(Boolean);
    
    return parts.join(', ') || 'Address not specified';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading listing details...</span>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">{error || 'Listing not found'}</p>
          <Button onClick={() => navigate('/listings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/listings')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Listings
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold">{listing.name}</h1>
                <p className="text-sm text-muted-foreground">Listing ID: {listing.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(listing.list_status || 'pending')}
              {getTypeBadge(listing.type)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Listing Name</label>
                    <p className="text-lg font-semibold">{listing.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="mt-1">{getTypeBadge(listing.type)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {listing.phone_number || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                {listing.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="mt-1 p-3 bg-muted rounded-lg">{listing.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Information */}
            {listing.profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Owner Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Owner Name</label>
                      <p className="text-lg">{listing.profile.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {listing.profile.phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Address Information */}
            {listing.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Address</label>
                      <p className="text-lg">{formatAddress(listing.address)}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address Line 1</label>
                        <p>{listing.address.address_line1 || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address Line 2</label>
                        <p>{listing.address.address_line2 || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Village</label>
                        <p>{listing.address.village || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">City</label>
                        <p>{listing.address.city || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">District</label>
                        <p>{listing.address.district || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">State</label>
                        <p>{listing.address.state || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pincode</label>
                        <p>{listing.address.pincode || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Landmark</label>
                        <p>{listing.address.landmark || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Space Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  Space Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Length (ft)</label>
                    <p className="text-lg font-semibold">{listing.length_ft || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Width (ft)</label>
                    <p className="text-lg font-semibold">{listing.width_ft || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Length (in)</label>
                    <p className="text-lg font-semibold">{listing.length_in || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Width (in)</label>
                    <p className="text-lg font-semibold">{listing.width_in || 'N/A'}</p>
                  </div>
                </div>
                {(listing.length_ft && listing.width_ft) && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Total Area: {listing.length_ft * listing.width_ft} sq ft</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Media Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Media Gallery ({listing.media?.length || 0} {listing.media?.length === 1 ? 'image' : 'images'})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listing.media && listing.media.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listing.media.map((media, index) => (
                      <div key={media.id} className="space-y-2">
                        <div className="relative group">
                          <img
                            src={media.url}
                            alt={`Space image ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg border shadow-sm group-hover:shadow-md transition-shadow"
                            onError={(e) => {
                              console.error('Failed to load image:', media.url);
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {media.type}
                          </div>
                        </div>
                        {media.metadata && (
                          <div className="text-xs text-muted-foreground">
                            <p>Metadata: {JSON.stringify(media.metadata)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No media available for this space</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange('approved')}
                  disabled={listing.list_status === 'approved' || actionLoading}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {actionLoading ? 'Processing...' : 'Approve Listing'}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleStatusChange('rejected')}
                  disabled={listing.list_status === 'rejected' || actionLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  {actionLoading ? 'Processing...' : 'Reject Listing'}
                </Button>
              </CardContent>
            </Card>

            {/* Listing Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Listing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(listing.list_status || 'pending')}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium">{listing.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">
                    {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Media Count</span>
                  <span className="text-sm font-medium">{listing.media?.length || 0}</span>
                </div>
                {(listing.length_ft && listing.width_ft) && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Area</span>
                    <span className="text-sm font-medium">{listing.length_ft * listing.width_ft} sq ft</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
