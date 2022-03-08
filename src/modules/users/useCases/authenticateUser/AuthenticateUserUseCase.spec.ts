import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { AppError } from "../../../../shared/errors/AppError";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";


let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate user', () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  })

  it('should be able authenticate user', async() => {
    
    const user: ICreateUserDTO = {
      name: 'Hitalo R Alves',
      email: 'hitalo.ralves@outlook.com',
      password: '12345'
    }

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    })

    expect(authenticatedUser.user).toHaveProperty('id');
    expect(authenticatedUser).toHaveProperty('token');
  })

  it('should not be able authenticate user with incorrect email', () => {

    expect(async() => {
      const user = await createUserUseCase.execute({
        name: 'Hitalo R Alves',
        email: 'hitalo.ralves@outlook.com',
        password: '12345'
      });

      await authenticateUserUseCase.execute({
        email: 'incorrectEmail@outlook.com',
        password: user.password
      });

    }).rejects.toBeInstanceOf(AppError);
  })

  it('should not be able authenticate user with incorrect password', () => {

    expect(async() => {
      const user = await createUserUseCase.execute({
        name: 'Hitalo R Alves',
        email: 'hitalo.ralves@outlook.com',
        password: '12345'
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrectPassword'
      });

    }).rejects.toBeInstanceOf(AppError);
  })
})