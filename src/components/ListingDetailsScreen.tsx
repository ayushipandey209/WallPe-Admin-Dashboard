import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, MapPin, User, Calendar, Phone, Ruler, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight, Star, Clock, Shield, Truck, Award } from 'lucide-react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
          console.log('Media data in listing:', listingData.media);
          console.log('Media length:', listingData.media?.length);
          
          // If no media data, add some sample images for testing
          if (!listingData.media || listingData.media.length === 0) {
            console.log('No media found, adding sample images for testing');
            listingData.media = [
              {
                id: 'sample-1',
                created_at: new Date().toISOString(),
                space_id: listingData.id,
                type: 'image',
                url: 'https://picsum.photos/800/800?random=1',
                metadata: null
              },
              {
                id: 'sample-2',
                created_at: new Date().toISOString(),
                space_id: listingData.id,
                type: 'image',
                url: 'https://picsum.photos/800/800?random=2',
                metadata: null
              },
              {
                id: 'sample-3',
                created_at: new Date().toISOString(),
                space_id: listingData.id,
                type: 'image',
                url: 'https://picsum.photos/800/800?random=3',
                metadata: null
              },
              {
                id: 'sample-4',
                created_at: new Date().toISOString(),
                space_id: listingData.id,
                type: 'image',
                url: 'https://picsum.photos/800/800?random=4',
                metadata: null
              },
              {
                id: 'sample-5',
                created_at: new Date().toISOString(),
                space_id: listingData.id,
                type: 'image',
                url: 'https://picsum.photos/800/800?random=5',
                metadata: null
              }
            ];
            console.log('Added sample media:', listingData.media);
          }
          
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

  // Image carousel functions
  const nextImage = () => {
    if (listing?.media && listing.media.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.media!.length);
    }
  };

  const prevImage = () => {
    if (listing?.media && listing.media.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.media!.length) % listing.media!.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Side - Image Carousel */}
          <div className="order-2 lg:order-1 max-w-lg mx-auto lg:max-w-none">
            {/* Main Image Display */}
            <div className="relative bg-white rounded-xl border-4 border-gray-200 shadow-2xl overflow-hidden mb-6 p-2">
              {(() => {
                console.log('Rendering carousel - listing.media:', listing.media);
                console.log('Media length:', listing.media?.length);
                console.log('Current image index:', currentImageIndex);
                return null;
              })()}
              {listing.media && listing.media.length > 0 ? (
                <>
                  <div className="relative aspect-square max-h-96 lg:max-h-[400px]">
                    <img
                      src={listing.media[currentImageIndex]?.url}
                      alt={`Space image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover transition-all duration-300 rounded-lg"
                      onError={(e) => {
                        console.error('Failed to load image:', listing.media?.[currentImageIndex]?.url);
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    
                    {/* Navigation Arrows */}
                    {listing.media.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-2 border-gray-300 w-10 h-10 rounded-full"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-lg border-2 border-gray-300 w-10 h-10 rounded-full"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    {listing.media.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/80 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                        {currentImageIndex + 1} / {listing.media.length}
                      </div>
                    )}
                    
                    {/* Sample Image Indicator */}
                    {listing.media.some(media => media.id.startsWith('sample-')) && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full shadow-lg border border-white/20">
                        Sample Images
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="aspect-square max-h-96 lg:max-h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                  <div className="text-center">
                    <ImageIcon className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 text-lg">No images available</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Media data: {listing.media ? 'exists but empty' : 'not found'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {listing.media && listing.media.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center lg:justify-start">
                {listing.media.map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-blue-500 ring-2 ring-blue-200 scale-105' 
                        : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                    }`}
                  >
                    <img
                      src={media.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons - Below Carousel */}
            <div className="space-y-4 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Listing Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                <button
                  className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={() => handleStatusChange('approved')}
                  disabled={listing.list_status === 'approved' || actionLoading}
                  style={{ backgroundColor: '#059669', color: 'white' }}
                >
                  <Check className="w-6 h-6 mr-2" />
                  {actionLoading ? 'Processing...' : 'Approve Listing'}
                </button>
                <button
                  className="w-full h-12 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={() => handleStatusChange('rejected')}
                  disabled={listing.list_status === 'rejected' || actionLoading}
                  style={{ backgroundColor: '#dc2626', color: 'white' }}
                >
                  <X className="w-6 h-6 mr-2" />
                  {actionLoading ? 'Processing...' : 'Reject Listing'}
                </button>
              </div>
              
              {/* Status Info */}
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600">
                  Current Status: <span className="font-bold text-lg">{listing.list_status || 'pending'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Product Title & Status */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">{listing.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {getStatusBadge(listing.list_status || 'pending')}
                  {getTypeBadge(listing.type)}
                </div>
                <p className="text-sm text-gray-500 font-mono">ID: {listing.id}</p>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-y border-gray-200">
                <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Ruler className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Dimensions</p>
                    <p className="text-lg font-bold text-gray-900">
                      {listing.length_ft && listing.width_ft 
                        ? `${listing.length_ft}ft × ${listing.width_ft}ft`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl border border-green-100">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Area</p>
                    <p className="text-lg font-bold text-gray-900">
                      {listing.length_ft && listing.width_ft 
                        ? `${listing.length_ft * listing.width_ft} sq ft`
                        : 'Not calculated'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.notes && (
              <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Description</h3>
                <p className="text-gray-700 leading-relaxed">{listing.notes}</p>
              </div>
            )}

            {/* Space Specifications */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Space Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Ruler className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Length (Feet)</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{listing.length_ft || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Ruler className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Width (Feet)</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{listing.width_ft || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Ruler className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Length (Inches)</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{listing.length_in || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Ruler className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Width (Inches)</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{listing.width_in || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-semibold">{listing.phone_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            {listing.profile && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Owner Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Owner Name</p>
                      <p className="font-semibold">{listing.profile.name || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Owner Phone</p>
                      <p className="font-semibold">{listing.profile.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Address Information */}
            {listing.address && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                    <div className="space-y-2">
                      <p className="font-semibold">{formatAddress(listing.address)}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        {listing.address.address_line1 && (
                          <p><span className="font-medium">Address:</span> {listing.address.address_line1}</p>
                        )}
                        {listing.address.village && (
                          <p><span className="font-medium">Village:</span> {listing.address.village}</p>
                        )}
                        {listing.address.city && (
                          <p><span className="font-medium">City:</span> {listing.address.city}</p>
                        )}
                        {listing.address.district && (
                          <p><span className="font-medium">District:</span> {listing.address.district}</p>
                        )}
                        {listing.address.state && (
                          <p><span className="font-medium">State:</span> {listing.address.state}</p>
                        )}
                        {listing.address.pincode && (
                          <p><span className="font-medium">Pincode:</span> {listing.address.pincode}</p>
                        )}
                        {listing.address.landmark && (
                          <p><span className="font-medium">Landmark:</span> {listing.address.landmark}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Listing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Listing Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Created Date</p>
                    <p className="font-semibold">
                      {listing.created_at ? new Date(listing.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500">Media Count</p>
                    <p className="font-semibold">{listing.media?.length || 0} images</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
