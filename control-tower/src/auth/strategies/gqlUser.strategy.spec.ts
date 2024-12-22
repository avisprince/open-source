import { GqlUserStrategy } from '#src/auth/strategies/gqlUser.strategy';
import { Test } from '@nestjs/testing';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('GqlUserStrategy', () => {
  let gqlUserStrategy: GqlUserStrategy;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [GqlUserStrategy],
    }).compile();

    gqlUserStrategy = module.get<GqlUserStrategy>(GqlUserStrategy);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('getRequest', () => {
    it('should return gqlReq if it exists', () => {
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getContext: jest.fn().mockReturnValue({
          req: {},
        }),
        getArgs: jest.fn().mockReturnValue({
          variables: 'test vars',
        }),
      } as any);

      const response = gqlUserStrategy.getRequest({} as any);

      expect(response.body).toEqual('test vars');
    });

    it('should return http if gql request does not exist', () => {
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getContext: jest.fn().mockReturnValue({
          req: null,
        }),
      } as any);

      const getRequest = jest.fn().mockReturnValue('success');
      const executionContext = {
        switchToHttp: jest.fn().mockImplementation(() => ({
          getRequest,
        })),
      } as any;

      const response = gqlUserStrategy.getRequest(executionContext);

      expect(getRequest).toBeCalledTimes(1);
      expect(response).toEqual('success');
    });
  });
});
