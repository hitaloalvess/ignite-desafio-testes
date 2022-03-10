import { Connection } from "typeorm";
import request  from 'supertest';

import CreateConnection from '../../../../database/index';
import { app } from "../../../../app";

let connection: Connection;

describe('Create User Controller', () => {
  beforeAll(async() => {
    connection = await CreateConnection();
    await connection.runMigrations();
  });

  afterAll(() => {
    connection.dropDatabase();
    connection.close();
  });

  it('should be able to create new user', async() => {
    const responseCreateUser = await request(app).post('/api/v1/users').send({
      name: 'Hitalo R Alves',
      email: 'hitalo.ralves@outlook.com',
      password: '12345'
    });

    expect(responseCreateUser.status).toBe(201);
  });

  it('should not be able to create new user with email exists', async() => {
    await request(app).post('/api/v1/users').send({
      name: 'Hitalo R Alves',
      email: 'hitalo.ralves@outlook.com',
      password: '12345'
    });

    const responseCreateUser = await request(app).post('/api/v1/users').send({
      name: 'Hitalo Rodrigo',
      email: 'hitalo.ralves@outlook.com',
      password: '123678'
    });

    expect(responseCreateUser.status).toBe(400);
  });

})