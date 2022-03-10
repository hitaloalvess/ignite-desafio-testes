import { hash } from 'bcryptjs';
import request  from 'supertest';

import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import CreateConnection   from '../../../../database/index';

let connection: Connection;
let authenticatedUser: request.Response;

describe('Create Statement Controller', () => {
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
    });

    await request(app).post('/api/v1/statements/deposit').send({
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
  })

  it('should be able to create statement', async() => {

      const { token, user } = authenticatedUser.body;

      const responseCreateDepositStatement = await request(app).post('/api/v1/statements/deposit').send({
        amount: 100,
        description: 'Venda notebook'
      }).set({
        Authorization: `Bearer ${token}`,
        user      
      });

      expect(responseCreateDepositStatement.status).toBe(201);
      expect(responseCreateDepositStatement.body).toHaveProperty('id');
  });

  it('should not be able to create statement for an unauthenticated user', async() => {
  
      const userUnauthenticated = {
        id: uuid(),
        name:'UserUnauthenticated',
        email:'userUnauthenticated@outlook.com',
        password: '12345'
      };
  
      const responseCreateDepositStatement = await request(app).post('/api/v1/statements/deposit').send({
        amount: 100,
        description: 'Venda'
      }).set({
        user: userUnauthenticated      
      });

      expect(responseCreateDepositStatement.status).toBe(401);
  });

  it('should not be able to create a withdraw statement greater than the current balance', async() => {

    const { token, user } = authenticatedUser.body;

    const responseCreateWithdrawStatement = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 999,
      description: 'Compras da semana'
    }).set({
      Authorization: `Bearer ${token}`,
      user
    });

    expect(responseCreateWithdrawStatement.status).toBe(400);

  })
  
})