import { User } from '../../entities/user.entity';
import { InMemoryUsersRepository } from '../../repositories/__tests__/in-memory-users.repository';
import { FakeCryptography } from '../../utils/encryption/__tests__/fake-cryptography';
import { CreateAccountUseCase } from '../create-account.use-case';

let sut: CreateAccountUseCase;
let inMemoryRepository: InMemoryUsersRepository;
let fakeCryptography: FakeCryptography;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryRepository = new InMemoryUsersRepository();
    fakeCryptography = new FakeCryptography();

    sut = new CreateAccountUseCase(inMemoryRepository, fakeCryptography);
  });

  it('Should be able to create a new user', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      socialName: 'John',
      email: 'johndoe@example.com',
      cpf: '12345678900',
      birthDate: '1990-01-01',
      phone: '123456789',
      password: '123456',
    });

    expect(result.isRight()).toBe(true);
  });

  it('should hash user password upon creation', async () => {
    const result = await sut.execute({
      name: 'John Doe',
      socialName: 'John',
      email: 'johndoe@example.com',
      cpf: '12345678900',
      birthDate: '1990-01-01',
      phone: '123456789',
      password: '123456',
    });

    const hashedPassword = await fakeCryptography.hash('123456');

    expect(result.isRight()).toBe(true);
    expect(inMemoryRepository.items[0].password).toEqual(hashedPassword);
  });

  it('should an error if the user with same email alredy exists', async () => {
    const user = User.create({
      name: 'John Doe',
      socialName: 'John',
      email: 'johndoe@example.com',
      cpf: '12345678900',
      birthDate: '1990-01-01',
      phone: '123456789',
      password: '123456',
    });

    inMemoryRepository.items.push(user);

    const result = await sut.execute({
      name: 'John Doe',
      socialName: 'John',
      email: 'johndoe@example.com',
      cpf: '12345678900',
      birthDate: '1990-01-01',
      phone: '123456789',
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should an error if the user with same cpf alredy exists', async () => {
    const user = User.create({
      name: 'John Doe',
      socialName: 'John',
      email: 'johndoe@example.com',
      cpf: '12345678900',
      birthDate: '1990-01-01',
      phone: '123456789',
      password: '123456',
    });

    inMemoryRepository.items.push(user);

    const result = await sut.execute({
      name: 'John Doe',
      socialName: 'John',
      email: 'another-johndoe@example.com',
      cpf: '12345678900',
      birthDate: '1990-01-01',
      phone: '123456789',
      password: '123456',
    });

    expect(result.isLeft()).toBe(true);
  });
});
