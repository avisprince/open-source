import { ActionLoggerService } from '#src/actionLogger/actionLogger.service';
import { ActionLoggerController } from '#src/actionLogger/actionLogger.controller';
import { Action } from '#src/mongo/models';
import { IConsoleLog } from '#src/actionLogger/dtos/IConsoleLog';
import { Test } from '@nestjs/testing';

describe('actionLogger controller', () => {
  let actionLoggerService: ActionLoggerService;
  let actionLoggerController: ActionLoggerController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ActionLoggerController],
      providers: [
        {
          provide: ActionLoggerService,
          useFactory: () => ({
            logAction: jest.fn(() => {}),
            logConsole: jest.fn(() => {}),
          }),
        },
      ],
    }).compile();

    actionLoggerService = module.get<ActionLoggerService>(ActionLoggerService);
    actionLoggerController = module.get<ActionLoggerController>(ActionLoggerController);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('logAction', () => {
    it('should call actionLoggerService', async () => {
      const mockAction = () =>
        ({
          actionId: 'fakeContainerId',
        } as Action);

      jest.spyOn(actionLoggerService, 'logAction').mockResolvedValueOnce(null);

      await actionLoggerController.logAction(mockAction());

      expect(actionLoggerService.logAction).toBeCalledTimes(1);
      expect(actionLoggerService.logAction).toHaveBeenCalledWith(mockAction());
    });
  });

  describe('logConsole', () => {
    it('should call actionLoggerService', async () => {
      const mockLogs = () => [
        {
          namespaceId: 'fakeId',
        } as IConsoleLog,
      ];

      jest.spyOn(actionLoggerService, 'logConsole').mockResolvedValueOnce(null);

      await actionLoggerController.postLog(mockLogs());

      expect(actionLoggerService.logConsole).toBeCalledTimes(1);
      expect(actionLoggerService.logConsole).toHaveBeenCalledWith(mockLogs());
    });
  });
});
