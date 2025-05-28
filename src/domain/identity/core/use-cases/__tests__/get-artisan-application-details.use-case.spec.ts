import { ArtisanApplication } from '../../entities/artisan-application.entity';
import { User } from '../../entities/user.entity';
import { ArtisanApplicationNotFoundError } from '../../errors/artisan-application-not-found.error';
import { InMemoryArtisanApplicationsRepository } from '../../repositories/__tests__/in-memory-artisan-applications.repository';
import { InMemoryUsersRepository } from '../../repositories/__tests__/in-memory-users.repository';
import { GetArtisanApplicationDetailsUseCase } from '../get-artisan-application-details.use-case';

let sut: GetArtisanApplicationDetailsUseCase;
let artisanApplicationsRepository: InMemoryArtisanApplicationsRepository;
let usersRepository: InMemoryUsersRepository;

describe('get artisan applications details use case', () => {
  const user = User.create(
    {
      name: 'John Doe',
      socialName: 'John',
      email: 'johndoe@example.com',
      cpf: '12345678900',
      birthDate: '1990-01-01',
      phone: '123456789',
      password: '123456-hashed',
    },
    'user-id',
  );

  const artisanApplication = ArtisanApplication.create(
    {
      userId: user.id,
      rawMaterial: 'Wood',
      technique: 'Wood carving',
      finalityClassification: 'Artistic',
      sicab: '123456789',
      sicabRegistrationDate: new Date('2023-05-10'),
      sicabValidUntil: new Date('2029-05-09'),
    },
    'artisan-application-id',
  );

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    artisanApplicationsRepository = new InMemoryArtisanApplicationsRepository();

    sut = new GetArtisanApplicationDetailsUseCase(
      artisanApplicationsRepository,
      usersRepository,
    );
  });

  it('should get a artisan applications successfully', async () => {
    usersRepository.save(user);
    artisanApplicationsRepository.save(artisanApplication);

    const result = await sut.execute({ artisanApplicationId: 'artisan-application-id' });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      artisanApplication: {
        userId: 'user-id',
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        rawMaterial: artisanApplication.rawMaterial,
        technique: artisanApplication.technique,
        finalityClassification: artisanApplication.finalityClassification,
        sicab: artisanApplication.sicab,
        sicabRegistrationDate: artisanApplication.sicabRegistrationDate,
        sicabValidUntil: artisanApplication.sicabValidUntil,
        status: artisanApplication.status,
      },
    });
  });

  it('should return error if no artisan application was found', async () => {
    const result = await sut.execute({ artisanApplicationId: 'artisan-application-id' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ArtisanApplicationNotFoundError);
  });
});
