import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../src/users/entities/user.entity';
import { UsersService } from '../../src/users/users.service';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';

describe('UsersService (Unit)', () => {
  let userservice: UsersService;
  let usersRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Logger,
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository, // Mock 또는 실제 Repository를 사용할 수 있습니다.
        },
      ],
    }).compile();

    userservice = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  describe('uploadProfile', () => {
    it('userid, filename이 주어진다면 해당 유저의 profileUrl을 수정하고 영향받은 행의 수를 반환', async () => {
      const userId = 1;
      const filename = '182739.png';
      const existingUser = new UserEntity();
      existingUser.userId = userId;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(existingUser);
      jest.spyOn(usersRepository, 'update').mockResolvedValue({ generatedMaps: [], raw: [], affected: 1 });

      const result = await userservice.uploadProfile(userId, filename);
      expect(result.affected).toEqual(1); // userservice의 리턴값을 result로 설정했을 때
    });

    it('userId, filename이 올바르게 주어졌지만 프로필 업데이트가 되지 않았으면 예외를 던진다.', async () => {
      const userId = 1;
      const filename = '153424.png';
      const existingUser = new UserEntity();
      existingUser.userId = userId;
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(existingUser);
      jest.spyOn(usersRepository, 'update').mockResolvedValue({ generatedMaps: [], raw: [], affected: 0 });

      const result = async () => {
        await userservice.uploadProfile(userId, filename);
      };
      await expect(result).rejects.toThrowError(new BadRequestException('Profile update failed: Invalid input data'));
    });

    it('생성되지 않은 userId가 주어졌으면 유저를 찾을 수 없다는 예외를 던진다.', async () => {
      const userId = 1000;
      const filename = '12313.png';
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(undefined);

      const result = async () => {
        await userservice.uploadProfile(userId, filename);
      };
      await expect(result).rejects.toThrowError(new NotFoundException('존재하지 않는 사용자입니다'));
    });
  });
});
