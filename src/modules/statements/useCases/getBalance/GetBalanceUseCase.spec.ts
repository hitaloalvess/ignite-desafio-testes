import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

let getBalanceUseCase: GetBalanceUseCase;

describe('Get balance', () => {

  beforeEach(() => {

    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);
  })

  it('should be able to get balance', async() => {
    const user = await usersRepositoryInMemory.create({
      name: 'Hitalo R Alves',
      email: 'hitalo.ralves@outlook.com',
      password: '12345'
    })

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string
    })

    expect(balance).toHaveProperty('statement');
    expect(balance).toHaveProperty('balance');
  })

  it('should not be able to get non-existent user balance', () => {
    expect(async() => {
      const user = {
        id: '1231234',
        name: 'User not-existent',
        email: 'userNotExistent@outlook.com',
        password: 'not-existent'
      }
  
      await getBalanceUseCase.execute({
        user_id: user.id
      })
    }).rejects.toBeInstanceOf(AppError);

  })
})