import { Test } from '@nestjs/testing';
import { UsersRepository } from '#src/mongo/repositories';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { UserDocument, User } from '#src/mongo/models';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    const userModelProvider = {
      provide: getModelToken(User.name),
      useValue: Model,
    };

    const module = await Test.createTestingModule({
      providers: [UsersRepository, userModelProvider],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call create', async () => {
      const mockUser = () =>
        ({
          email: 'fake@email.com',
        } as User);

      jest.spyOn(userModel, 'create').mockResolvedValue(mockUser() as never);

      const result = await usersRepository.create(mockUser());

      expect(userModel.create).toBeCalledTimes(1);
      expect(result.email).toEqual(mockUser().email);
    });
  });

  describe('findByEmail', () => {
    it('should call Model findByEmail without populate', async () => {
      const mockUser = () =>
        ({
          email: 'fake@email.com',
        } as User);

      const populate = jest.fn(() => {});
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn(() => mockUser()),
        populate,
      } as any);

      const result = await usersRepository.findByEmail('fake@email.com');

      expect(userModel.findOne).toBeCalledTimes(1);
      expect(populate).toBeCalledTimes(0);
      expect(userModel.findOne).toBeCalledWith({ email: 'fake@email.com' });
      expect(result.email).toEqual(mockUser().email);
    });

    it('should call Model findByEmail with populate', async () => {
      const mockUser = () =>
        ({
          email: 'fake@email.com',
        } as User);

      const populate = jest.fn(() => {});
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn(() => mockUser()),
        populate,
      } as any);

      const result = await usersRepository.findByEmail('fake@email.com', true);

      expect(userModel.findOne).toBeCalledTimes(1);
      expect(populate).toBeCalledTimes(1);
      expect(userModel.findOne).toBeCalledWith({ email: 'fake@email.com' });
      expect(result.email).toEqual(mockUser().email);
    });
  });
});
