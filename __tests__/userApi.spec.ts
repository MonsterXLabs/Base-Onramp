// tests/services/userService.test.ts
import 'reflect-metadata';
import { setupTestDB, teardownTestDB } from './testDb';
import { UserService } from '@/services/user.service';
import { expect } from '@jest/globals';
import { UserModel } from '@/entities/user.entity';

describe('UserService', () => {
  let userService;

  beforeAll(async () => {
    await setupTestDB();
    userService = new UserService();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  it('should create and retrieve a user by ID', async () => {
    const testUser = await UserModel.create({
      wallet: 'John Doe',
      email: 'john@example.com',
    });
    const result = await userService.getUserById(testUser._id.toString());

    expect(result).not.toBeNull();
    expect(result?.wallet).toBe('John Doe');
    expect(result?.email).toBe('john@example.com');
  });

  it('should return null for a non-existent user', async () => {
    const result = await userService.getUserById('615f0c4c4bfe2b6d60d5c8d1');
    expect(result).toBeNull();
  });
});
