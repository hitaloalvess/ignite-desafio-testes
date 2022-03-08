import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';


let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;


describe('Show user profile', () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

  })

  it('should be able to show the user profile', async() => {

    const newUser = await createUserUseCase.execute({
      name: 'Hitalo R Alves',
      email: 'hitalo.ralves@outlook.com',
      password: '12345'
    });

    const user = await showUserProfileUseCase.execute(newUser.id as string);

    expect(user).toHaveProperty('id');

  })

  it('should not be able to show the profile of a non-existent user', () => {
    expect(async() => {

      const user_id = '123456';

      await showUserProfileUseCase.execute(user_id);
    
    }).rejects.toBeInstanceOf(AppError);
  })
})