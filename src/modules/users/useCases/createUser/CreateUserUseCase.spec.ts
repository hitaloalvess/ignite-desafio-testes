import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from './CreateUserUseCase';

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create a new User', () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })

  it('should be able to create new user', async() => {

    const user = await createUserUseCase.execute({
      name: 'Hitalo R Alves',
      email: 'hitalo.ralves@outlook.com',
      password: '12345'
    });

    expect(user).toHaveProperty('id');
  })

  it('should be not able to create a new user with email already exists', async() => {

    expect(async () => {
      await createUserUseCase.execute({
        name: 'Hitalo R Alves',
        email: 'hitalo.ralves@outlook.com',
        password: '12345'
      });

      await createUserUseCase.execute({
        name: 'Hitalo R Alves',
        email: 'hitalo.ralves@outlook.com',
        password: '12345'
      });
    }).rejects.toBeInstanceOf(AppError);

  });

})