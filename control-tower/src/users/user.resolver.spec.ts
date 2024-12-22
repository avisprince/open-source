import Ctx from '#src/types/graphql.context.type';
import { Test } from '@nestjs/testing';
import { User } from '#src/mongo/models';
import { CanActivate } from '@nestjs/common';
import { returnUser, UserResolver } from '#src/users/user.resolver';

describe('UserResolver', () => {
  let userResolver: UserResolver;

  beforeAll(async () => {
    const mockGuard: CanActivate = {
      canActivate: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [UserResolver],
    }).compile();

    userResolver = module.get<UserResolver>(UserResolver);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('decorators', () => {
    it('should return correct types', () => {
      expect(returnUser()).toEqual(User);
    });
  });

  describe('currentUser', () => {
    it('should return the user from context', async () => {
      const mockContext = () =>
        ({
          req: {
            user: {
              name: 'test user',
            } as User,
          },
        } as Ctx);

      const result = await userResolver.currentUser(mockContext());

      expect(result.name).toEqual(mockContext().req.user.name);
    });
  });
});
