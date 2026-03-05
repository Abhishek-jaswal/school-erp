import PocketBase from 'pocketbase';

export const pb = new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
);

// IMPORTANT: Disable auto-cancellation globally.
// PocketBase cancels "duplicate" requests by default which breaks
// Promise.all() calls and rapid navigation between pages.
pb.autoCancellation(false);