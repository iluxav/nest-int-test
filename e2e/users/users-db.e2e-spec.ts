import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { User } from '../../src/users/user.entity';
import { UsersController } from '../../src/users/users.controller';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { CreateUserDto } from '../../TestService/models/CreateUserDto';
import { User as sUser } from '../../TestService/models/User';
import { TestServiceSDK } from '../../TestService/TestServiceSDK';

describe('Users DB', () => {
  let app: INestApplication;
  let testServiceSDK: TestServiceSDK;

  let service: UsersService;
  let repo = {
    save: jest.fn().mockImplementation(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(repo)
      .compile();
    service = moduleRef.get<UsersService>(UsersService);
    // repo = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    app = moduleRef.createNestApplication();
    await app.init();
    app.listen(3000);
    testServiceSDK = new TestServiceSDK({
      BASE: 'http://localhost:3000',
    });
  });

  it(`/POST Create User`, async () => {
    jest.spyOn(repo, 'save').mockReturnValue({
      lastName: 'Vinokurov',
      firstName: 'Ilya',
      id: 123,
      isActive: true,
    });
    const res = await testServiceSDK.default.createUser({
      lastName: 'Vinokurov',
      firstName: 'Ilya',
    });
    expect(res.lastName).toEqual('Vinokurov');
  });

  afterAll(async () => {
    await app.close();
  });
});
