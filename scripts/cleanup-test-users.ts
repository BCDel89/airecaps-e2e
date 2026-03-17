import { request } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://api.airecaps.com';

/**
 * Cleanup script: Deletes e2e test users created during test runs.
 * 
 * Test users match the pattern: e2e-*@airecaps-test.local
 * 
 * Usage:
 *   npx ts-node scripts/cleanup-test-users.ts
 *   API_URL=https://api.airecaps.com npx ts-node scripts/cleanup-test-users.ts
 */
async function cleanup() {
  console.log(`Cleaning up test users on ${API_URL}...`);
  
  // Login as admin to get user list
  const ctx = await request.newContext();
  
  // Get list of test users via admin endpoint
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.log('ADMIN_PASSWORD not set — skipping cleanup.');
    console.log('Set ADMIN_PASSWORD env var to enable cleanup.');
    return;
  }
  
  // Login as admin
  const loginRes = await ctx.post(`${API_URL}/api/auth/login`, {
    data: { email: 'admin@airecaps.com', password: adminPassword }
  });
  
  if (loginRes.status() !== 200) {
    console.log('Admin login failed — cannot clean up test users.');
    return;
  }
  
  const { token } = await loginRes.json();
  
  // Get all users
  const usersRes = await ctx.get(`${API_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (usersRes.status() !== 200) {
    console.log('Failed to fetch users — admin endpoint may not exist yet.');
    return;
  }
  
  const users = await usersRes.json();
  const testUsers = users.filter((u: any) => 
    u.email && u.email.endsWith('@airecaps-test.local')
  );
  
  console.log(`Found ${testUsers.length} test users to clean up.`);
  
  let deleted = 0;
  for (const user of testUsers) {
    try {
      const delRes = await ctx.delete(`${API_URL}/api/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (delRes.ok()) {
        deleted++;
        console.log(`  Deleted: ${user.email} (id: ${user.id})`);
      } else {
        console.log(`  Failed to delete ${user.email}: ${delRes.status()}`);
      }
    } catch (err) {
      console.log(`  Error deleting ${user.email}:`, err);
    }
  }
  
  console.log(`Cleanup complete: ${deleted}/${testUsers.length} test users deleted.`);
}

cleanup().catch(console.error);
