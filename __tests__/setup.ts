import { setupTestDB, teardownTestDB } from './testDb';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});
