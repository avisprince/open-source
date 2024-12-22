import { UserStrategy } from '#src/auth/strategies/user.strategy';
import { AuthRepository, UsersRepository } from '#src/mongo/repositories';
import { Test } from '@nestjs/testing';
import { Auth, User } from '#src/mongo/models';

describe('UserStrategy', () => {
  let userStrategy: UserStrategy;
  let usersRepository: UsersRepository;
  let authRepository: AuthRepository;

  beforeAll(async () => {
    const usersRepositoryProvider = {
      provide: UsersRepository,
      useFactory: () => ({
        findByEmail: jest.fn(),
      }),
    };

    const authRepositoryProvider = {
      provide: AuthRepository,
      useFactory: () => ({
        findByAccessToken: jest.fn(),
      }),
    };

    const module = await Test.createTestingModule({
      providers: [UserStrategy, usersRepositoryProvider, authRepositoryProvider],
    }).compile();

    userStrategy = module.get<UserStrategy>(UserStrategy);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    authRepository = module.get<AuthRepository>(AuthRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should call AuthRepository and UsersRepository', async () => {
      const mockAuth = () => {
        return {
          accessToken: '123',
          user: {
            email: 'testEmail',
          },
        } as Auth;
      };

      jest.spyOn(authRepository, 'findByAccessToken').mockResolvedValue(mockAuth());

      await userStrategy.validate('accessToken');

      expect(authRepository.findByAccessToken).toBeCalledTimes(1);
      expect(authRepository.findByAccessToken).toBeCalledWith('accessToken');
      expect(usersRepository.findByEmail).toBeCalledTimes(1);
      expect(usersRepository.findByEmail).toBeCalledWith('testEmail', true);
    });
  });
});
