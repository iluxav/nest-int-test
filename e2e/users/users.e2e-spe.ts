import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { UsersService } from '../../src/users/users.service';
import { CreateUserDto } from '../../TestService/models/CreateUserDto';
import { User } from '../../TestService/models/User';
import { TestServiceSDK } from '../../TestService/TestServiceSDK';

describe('Users', () => {
  const usersService = (() => {
    let users: User[] = [];
    return {
      findAll: () => users,
      create: (user: CreateUserDto) => {
        const _user = {
          id: new Date().getTime(),
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: true,
        };
        users.push(_user);
        return _user;
      },
    };
  })();

  let app: INestApplication;
  let testServiceSDK: TestServiceSDK;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    app.listen(3000);
    testServiceSDK = new TestServiceSDK({
      BASE: 'http://localhost:3000',
    });
  });

  it(`/POST Create User`, async () => {
    const res = await testServiceSDK.default.createUser({
      lastName: 'Vinokurov',
      firstName: 'Ilya',
    });
    expect(res.lastName).toEqual('Vinokurov');
  });

  it(`/GET Users`, async () => {
    const res = await testServiceSDK.default.findAllUsers();
    expect(res).toEqual(usersService.findAll());
  });

  afterAll(async () => {
    await app.close();
  });
});
