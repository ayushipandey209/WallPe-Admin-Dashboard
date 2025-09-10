# Services Layer - Supabase Integration

This folder contains all the service functions for integrating with Supabase database.

## Structure

```
src/services/
├── supabase.ts          # Supabase client configuration
├── profileService.ts    # Profile CRUD operations
├── testConnection.ts    # Connection testing utility
├── index.ts            # Service exports
└── README.md           # This file
```

## Setup

1. **Supabase Client**: Configured with your project URL and anon key
2. **TypeScript Types**: Auto-generated types for database schema
3. **Service Classes**: Organized by data model (Profile, etc.)

## Usage

### Import Services
```typescript
import { ProfileService, supabase } from '../services';
```

### Profile Service
```typescript
// Get all profiles
const profiles = await ProfileService.getAllProfiles();

// Get single profile
const profile = await ProfileService.getProfileById('user-id');

// Create profile
const newProfile = await ProfileService.createProfile({
  id: 'user-id',
  name: 'John Doe',
  phone: '+1234567890'
});

// Update profile
const updated = await ProfileService.updateProfile('user-id', {
  name: 'Jane Doe'
});

// Delete profile
await ProfileService.deleteProfile('user-id');

// Search profiles
const results = await ProfileService.searchProfiles('john');

// Paginated results
const paginated = await ProfileService.getProfilesPaginated(1, 10, 'search');
```

## Database Schema

### Profile Table
```sql
CREATE TABLE public.profile (
  id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NULL,
  phone text NOT NULL,
  CONSTRAINT profile_pkey PRIMARY KEY (id),
  CONSTRAINT profile_id_fkey FOREIGN KEY (id) 
    REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE
);
```

## Error Handling

All service functions include proper error handling:
- Try-catch blocks for async operations
- Console logging for debugging
- Error propagation to calling components
- User-friendly error messages

## Future Enhancements

1. **Listings Service**: For managing advertising listings
2. **Notifications Service**: For user notifications
3. **Analytics Service**: For dashboard metrics
4. **Caching**: Add React Query or SWR for data caching
5. **Real-time**: Add Supabase real-time subscriptions

## Testing

Use the test connection utility:
```typescript
import { testSupabaseConnection } from './testConnection';

// Test in browser console or component
testSupabaseConnection().then(result => {
  console.log('Connection test result:', result);
});
```
