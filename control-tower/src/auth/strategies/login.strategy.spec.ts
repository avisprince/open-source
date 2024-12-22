import { Test } from '@nestjs/testing';
import { LoginStrategy } from '#src/auth/strategies/login.strategy';
import { AuthRepository, OrganizationsRepository, UsersRepository } from '#src/mongo/repositories';
import { Auth0Client } from '#src/auth/clients/auth0.client';
import { Auth, Organization, User } from '#src/mongo/models';
import { OrganizationRoles } from '#src/constants/roles.constants';
import { Schema as MongooseSchema } from 'mongoose';

describe('LoginStrategy', () => {
  let loginStrategy: LoginStrategy;
  let usersRepository: UsersRepository;
  let authRepository: AuthRepository;
  let auth0Client: Auth0Client;
  let organizationsRepository: OrganizationsRepository;

  process.env.AUTH0_CLIENT_ID = 'AUTH0_CLIENT_ID';
  process.env.AUTH0_CLIENT_SECRET = 'AUTH0_CLIENT_SECRET';
  process.env.AUTH_CALLBACK_DOMAIN = 'AUTH_CALLBACK_DOMAIN';
  process.env.AUTH0_DOMAIN = 'AUTH0_DOMAIN';

  beforeAll(async () => {
    const usersRepositoryProvider = {
      provide: UsersRepository,
      useFactory: () => ({
        findByEmail: jest.fn(),
        create: jest.fn(),
      }),
    };

    const authRepositoryProvider = {
      provide: AuthRepository,
      useFactory: () => ({
        create: jest.fn(),
      }),
    };

    const auth0ClientProvider = {
      provide: Auth0Client,
      useFactory: () => ({
        getUserInfo: jest.fn(),
      }),
    };

    const organizationsRepositoryProvider = {
      provide: OrganizationsRepository,
      useFactory: () => ({
        create: jest.fn(),
      }),
    };

    const module = await Test.createTestingModule({
      providers: [LoginStrategy, usersRepositoryProvider, authRepositoryProvider, auth0ClientProvider, organizationsRepositoryProvider],
    }).compile();

    loginStrategy = module.get<LoginStrategy>(LoginStrategy);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    authRepository = module.get<AuthRepository>(AuthRepository);
    auth0Client = module.get<Auth0Client>(Auth0Client);
    organizationsRepository = module.get<OrganizationsRepository>(OrganizationsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  const mockUser = () => {
    return {
      id: new MongooseSchema.Types.ObjectId(''),
      email: 'mock email',
    } as User;
  };

  const mockOrg = () => {
    return {
      id: new MongooseSchema.Types.ObjectId(''),
    } as Organization;
  };

  const mockAuth = () => {
    return {
      accessToken: '123',
    } as Auth;
  };

  describe('validate', () => {
    it('should not create a user if one already exists', async () => {
      const accessToken = 'accessToken';

      jest.spyOn(auth0Client, 'getUserInfo').mockResolvedValue(mockUser());
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValue(mockUser());
      jest.spyOn(authRepository, 'create').mockResolvedValue(mockAuth());

      const response = await loginStrategy.validate(accessToken);

      expect(response).toEqual(accessToken);
      expect(auth0Client.getUserInfo).toBeCalledTimes(1);
      expect(auth0Client.getUserInfo).toBeCalledWith(accessToken);
      expect(usersRepository.findByEmail).toBeCalledTimes(1);
      expect(usersRepository.findByEmail).toBeCalledWith(mockUser().email);
      expect(organizationsRepository.create).toBeCalledTimes(0);
      expect(authRepository.create).toBeCalledTimes(1);
      expect(authRepository.create).toBeCalledWith({
        accessToken,
        user: mockUser().id,
      });
    });

    it('should create a user if one does not exist', async () => {
      const accessToken = 'accessToken';

      jest.spyOn(auth0Client, 'getUserInfo').mockResolvedValue(mockUser());
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersRepository, 'create').mockResolvedValue(mockUser());
      jest.spyOn(organizationsRepository, 'create').mockResolvedValue(mockOrg());
      jest.spyOn(authRepository, 'create').mockResolvedValue(mockAuth());

      const response = await loginStrategy.validate(accessToken);

      const expectedUser = mockUser();

      expect(response).toEqual(accessToken);
      expect(organizationsRepository.create).toBeCalledTimes(1);
      expect(organizationsRepository.create).toBeCalledWith({
        name: expectedUser.email,
        members: [
          {
            email: expectedUser.email,
            role: OrganizationRoles.ADMIN,
          },
        ],
      });
      expect(usersRepository.create).toBeCalledTimes(1);
      expect(usersRepository.create).toBeCalledWith({
        ...expectedUser,
        organizations: [mockOrg().id],
      });
    });
  });
});
