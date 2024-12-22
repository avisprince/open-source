import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Auth, AuthDocument } from '#src/mongo/models';
import { AuthRepository } from '#src/mongo/repositories';

describe('AuthRepository', () => {
  let authRepository: AuthRepository;
  let authModel: Model<AuthDocument>;

  beforeAll(async () => {
    const authModelProvider = {
      provide: getModelToken(Auth.name),
      useValue: Model,
    };

    const module = await Test.createTestingModule({
      providers: [AuthRepository, authModelProvider],
    }).compile();

    authRepository = module.get<AuthRepository>(AuthRepository);
    authModel = module.get<Model<AuthDocument>>(getModelToken(Auth.name));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call create', async () => {
      const mockAuth = () =>
        ({
          accessToken: '1234',
          user: null,
        } as Auth);

      jest.spyOn(authModel, 'create').mockResolvedValue(mockAuth() as never);

      const result = await authRepository.create(mockAuth());

      expect(authModel.create).toBeCalledTimes(1);
      expect(result.accessToken).toEqual(mockAuth().accessToken);
    });
  });

  describe('findByAccessToken', () => {
    it('should call Model find', async () => {
      const mockAuth = () =>
        ({
          accessToken: '123',
        } as Auth);

      const populate = jest.fn(() => ({
        exec: jest.fn(() => [mockAuth()]),
      }));
      jest.spyOn(authModel, 'find').mockReturnValue({
        populate,
      } as any);

      const result = await authRepository.findByAccessToken('123');

      expect(authModel.find).toBeCalledTimes(1);
      expect(authModel.find).toBeCalledWith({ accessToken: '123' });
      expect(populate).toBeCalledTimes(1);
      expect(populate).toBeCalledWith('user');
      expect(result.accessToken).toEqual(mockAuth().accessToken);
    });
  });
});
