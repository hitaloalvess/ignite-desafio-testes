import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe('Create statement', () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory ,statementsRepositoryInMemory);
  });

  it('should be able to create statement', async() => {
      const user = await usersRepositoryInMemory.create({
        name: 'Hitalo R Alves',
        email: 'hitalo.ralves@outlook.com',
        password: '12345'
      })
      const type = 'deposit' as OperationType;
      const amount = 1000;
      const description = 'Venda notebook';

      const statementOperation = await createStatementUseCase.execute({
        user_id: user.id as string,
        type,
        amount,
        description
      })

      expect(statementOperation).toHaveProperty('id');
  })

  it('should be able to create a statement for a non-existent user', () => {
    expect(async() => {
      const user = {
        id: '1231234',
        name: 'User not-existent',
        email: 'userNotExistent@outlook.com',
        password: 'not-existent'
      }
      const type = 'deposit' as OperationType;
      const amount = 1000;
      const description = 'Venda notebook';
  
      await createStatementUseCase.execute({
        user_id: user.id,
        type: type,
        amount,
        description
      }) 
    }).rejects.toBeInstanceOf(AppError);
  })

  it('should not be able to create a withdraw statement greater than the current balance', () => {
    expect(async() => {
      const user = await usersRepositoryInMemory.create({
        name: 'Hitalo R Alves',
        email: 'hitalo.ralves@outlook.com',
        password: '12345'
      })

      const type = 'withdraw' as OperationType;
      const amount = 3000;
      const description = 'Compra notebook';

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type,
        amount,
        description
      })

    }).rejects.toBeInstanceOf(AppError);
  })



})