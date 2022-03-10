import { Connection } from "typeorm";
import request  from 'supertest';
import { v4 as uuid } from 'uuid';
import { hash } from 'bcryptjs';

import CreateConnection from '../../../../database/index';
import { app } from "../../../../app";

let connection: Connection;
let authenticatedUser: request.Response;

describe('Show User Profile Controller', () => {
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

  });

  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show user profile', async() => {

    const { token, user} = authenticatedUser.body;

    const responseShowProfile = await request(app).get('/api/v1/profile').send({
      id: user.id
    }).set({
      Authorization: `Bearer ${token}`,
    })

    expect(responseShowProfile.status).toBe(200);
    expect(responseShowProfile.body).toHaveProperty('id');

  });

  it('should not be able to show the profile of an unauthenticated user', async() => {
    const userUnauthenticated = {
      id: uuid(),
      name:'UserUnauthenticated',
      email:'userUnauthenticated@outlook.com',
      password: '12345'
    };

    const responseShowProfile = await request(app).get('/api/v1/profile').send({
      id: userUnauthenticated.id
    });


    expect(responseShowProfile.status).toBe(401);
  });

})