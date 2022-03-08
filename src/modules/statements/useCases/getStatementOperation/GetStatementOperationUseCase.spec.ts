import { AppError } from "../../../../shared/errors/AppError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get statement operation', () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);
  })

  it('should be able to get statement operation', async() => {
    const user = await usersRepositoryInMemory.create({
      name: 'Hitalo R Alves',
      email: 'hitalo.ralves@outlook.com',
      password: '12345'
    })
    const statement = await statementsRepositoryInMemory.create({
      user_id: user.id as string,
      amount: 1000,
      type: 'deposit' as OperationType,
      description: 'Venda de software'
    })

    const statementOperation =  await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    })

    expect(statementOperation).toHaveProperty('id');
  })

  it('should not be able to get an statement operation from a non-existent user', () => {
    expect(async() => {
      const user = {
        id: '1231234',
        name: 'User not-existent',
        email: 'userNotExistent@outlook.com',
        password: 'not-existent'
      }
      const statement_id = '12345'
  
      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id
      })
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to get an statement non-existent', () => {
    expect(async() => {
      const user = await usersRepositoryInMemory.create({
        name: 'Hitalo R Alves',
        email: 'hitalo.ralves@outlook.com',
        password: '12345'
      })
      const statement_id = '12345'
  
      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id
      })
    }).rejects.toBeInstanceOf(AppError);
  });
})


