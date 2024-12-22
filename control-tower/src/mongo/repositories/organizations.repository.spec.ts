import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Organization, OrganizationDocument } from '#src/mongo/models';
import { OrganizationsRepository } from '#src/mongo/repositories';

describe('OrganizationsRepository', () => {
  let organizationsRepository: OrganizationsRepository;
  let organizationModel: Model<OrganizationDocument>;

  beforeAll(async () => {
    const organizationModelProvider = {
      provide: getModelToken(Organization.name),
      useValue: Model,
    };

    const module = await Test.createTestingModule({
      providers: [OrganizationsRepository, organizationModelProvider],
    }).compile();

    organizationsRepository = module.get<OrganizationsRepository>(
      OrganizationsRepository,
    );
    organizationModel = module.get<Model<OrganizationDocument>>(
      getModelToken(Organization.name),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call Model create', async () => {
      const mockOrganization = () =>
        ({
          name: 'test',
        } as Organization);

      jest
        .spyOn(organizationModel, 'create')
        .mockResolvedValue(mockOrganization() as never);

      const result = await organizationsRepository.create(mockOrganization());

      expect(organizationModel.create).toBeCalledTimes(1);
      expect(result.name).toEqual(mockOrganization().name);
    });
  });

  describe('findById', () => {
    it('should call Model findById', async () => {
      const mockOrganization = () =>
        ({
          name: 'test',
        } as Organization);

      jest.spyOn(organizationModel, 'findById').mockReturnValue({
        exec: jest.fn(() => mockOrganization()),
      } as any);

      const result = await organizationsRepository.findById('123');

      expect(organizationModel.findById).toHaveBeenCalledTimes(1);
      expect(result.name).toEqual(mockOrganization().name);
    });
  });
});
