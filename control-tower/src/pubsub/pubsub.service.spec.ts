import { Test } from '@nestjs/testing';
import { PubSubService } from './pubsub.service';

describe('pubsub service', () => {
  let pubsubService: PubSubService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PubSubService],
    }).compile();

    pubsubService = module.get<PubSubService>(PubSubService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('pubsub', () => {
    it('should get a pub sub class', () => {
      const pubsub = pubsubService.pubsub;
      expect(pubsub).not.toBeNull();
    });
  });
});
