// cypress/e2e/userApi.cy.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModel } from '../../src/entities/user.entity';

describe('User API with MongoMemoryServer', () => {
  let mongoServer;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {});

    // Seed a test user
    await UserModel.create({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should return user data when hitting the API endpoint', () => {
    cy.request('GET', '/api/users').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('name', 'John Doe');
    });
  });

  it('should return 404 for a non-existing user', () => {
    const invalidId = new mongoose.Types.ObjectId();
    cy.request({
      method: 'GET',
      url: `/api/users/${invalidId}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });
});
