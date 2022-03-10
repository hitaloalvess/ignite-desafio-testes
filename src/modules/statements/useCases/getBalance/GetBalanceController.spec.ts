import { hash } from 'bcryptjs';
import request  from 'supertest';

import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import CreateConnection   from '../../../../database/index';

let connection: Connection;
let authenticatedUser: request.Response;
let statementCreated: request.Response;

describe('Get Balance Controller', () => {

  beforeAll(async() => {
    connection = await CreateConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash('userPassword', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'userDefault', 'userdefault@outlook.com', '${password}', now(), now())`
    );

    authenticatedUser =  await request(app).post('/api/v1/sessions').send({
      email:'userdefault@outlook.com',
      password: 'userPassword'
    })

    statementCreated = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Venda notebook'
    }).set({
      Authorization: `Bearer ${authenticatedUser.body.token}`,
      user: authenticatedUser.body.user      
    });

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get balance', async() => {
    
    const { token, user } = authenticatedUser.body;

    const responseGetBalance = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`,
      user  
    });

    expect(responseGetBalance.status).toBe(200);
    expect(responseGetBalance.body).toHaveProperty('statement');
    expect(responseGetBalance.body).toHaveProperty('balance');
  });

  it('should not be able to get balance for an unauthenticated user', async() => {
    const userUnauthenticated = {
      id: uuid(),
      name:'UserUnauthenticated',
      email:'userUnauthenticated@outlook.com',
      password: '12345'
    };

    const responseGetBalance = await request(app).get('/api/v1/statements/balance').set({
      user: userUnauthenticated      
    });

    expect(responseGetBalance.status).toBe(401);
  });
})