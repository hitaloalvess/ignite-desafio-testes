import { hash } from 'bcryptjs';
import request  from 'supertest';

import { Connection } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { app } from '../../../../app';
import CreateConnection   from '../../../../database/index';

let connection: Connection;

describe('Authenticate User Controller', () => {

  beforeAll(async() => {
    connection = await CreateConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash('userPassword', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'userDefault', 'userdefault@outlook.com', '${password}', now(), now())`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to authenticated user', async() => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'userdefault@outlook.com',
      password: 'userPassword'
    })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should not be able to authenticated user with incorrect email', async() => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'userincorrect@outlook.com',
      password: 'userPassword'
    })

    expect(response.status).toBe(401);
  });

  it('should not be able to authenticated user with incorrect password', async() => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'userdefault@outlook.com',
      password: 'passwordIncorrect'
    })

    expect(response.status).toBe(401);
  });
  
})