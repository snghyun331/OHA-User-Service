import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { EntityManager, In, Repository } from 'typeorm';
import { UserEntity } from '../../entity/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateNameDto } from './dto/update-name.dto';
import { UsersInfoDto } from './dto/users-info.dto';
import { unlink } from 'fs/promises';
import { UPLOAD_PATH } from '../../utils/path';
import { ConsumerService } from '../kafka/kafka.consumer.service';
import { ProducerService } from '../kafka/kafka.producer.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @Inject(Logger)
    private readonly logger: LoggerService,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private readonly consumerService: ConsumerService,
    private readonly producerService: ProducerService,
  ) {}

  async updateNickname(userId: number, dto: UpdateNameDto, transactionManager: EntityManager) {
    try {
      const { name } = dto;
      await this.checkNicknameExists(name, userId);
      await transactionManager.update(UserEntity, userId, { name });
      return;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async uploadProfile(userId: number, filename: string, transactionManager: EntityManager) {
    try {
      if (!filename) {
        throw new BadRequestException('요청한 프로필이 없습니다');
      }
      const user = await this.usersRepository.findOne({ where: { userId } });

      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다');
      }
      const userProfile = user.profileUrl;

      // 기존 프로필 사진이 존재할 경우
      if (userProfile !== null) {
        const userProfileName = userProfile.split('/').pop();
        await unlink(`${UPLOAD_PATH}/${userProfileName}`);
      }

      const url = `https://ohauser2.serveftp.com/files/user/${filename}`;

      const result = await transactionManager.update(UserEntity, userId, { profileUrl: url });
      if (result.affected === 0) {
        throw new BadRequestException('Profile update failed: Invalid input data');
      }
      return { imageUrl: url };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getUserById(userId: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { userId },
        select: ['userId', 'providerType', 'name', 'email', 'profileUrl', 'createdAt', 'updatedAt'],
      });
      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다');
      }

      return user;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getUsers() {
    try {
      const allUsers = await this.usersRepository.find({
        select: ['userId', 'providerType', 'name', 'email', 'profileUrl', 'createdAt', 'updatedAt'],
      });
      return allUsers;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getSpecificUsers(dto: UsersInfoDto, manager: EntityManager) {
    try {
      const { userIds } = dto;
      if (!userIds || userIds.length === 0) {
        throw new BadRequestException('요청한 유저 아이디가 없습니다');
      }
      const users = await manager.getRepository(UserEntity).find({
        where: { userId: In(userIds) },
        select: ['userId', 'providerType', 'name', 'email', 'profileUrl', 'createdAt', 'updatedAt'],
      });

      if (users.length !== userIds.length) {
        for (const userId of userIds) {
          const userExists = users.some((user) => user.userId === userId);
          if (!userExists) {
            throw new NotFoundException(`아이디가 ${userId}인 유저는 존재하지 않습니다`);
          }
        }
      }
      return users;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async deleteProfile(userId: number, transactionManager: EntityManager) {
    try {
      const user = await this.usersRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException('존재하지 않는 사용자입니다.');
      }
      const userProfile = user.profileUrl;
      if (userProfile === null) {
        throw new NotFoundException('프로필이 이미 삭제되었거나 존재하지 않습니다');
      }
      await transactionManager.update(UserEntity, userId, { profileUrl: null });
      const fileName = userProfile.split('/').pop();
      await unlink(`${UPLOAD_PATH}/${fileName}`);
      return;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  private async checkNicknameExists(name: string, currentUserId: number) {
    const user = await this.usersRepository.findOne({ where: { name } });
    if (user && currentUserId !== user.userId) {
      // 동일한 닉네임 유저가 이미 있으며, 그 유저가 본인이 아닐 경우에
      throw new ConflictException('이미 있는 닉네임입니다');
    } else {
      return;
    }
  }

  async getSendTopic(topic: string) {
    const words = topic.split('-');
    words.splice(words.length - 1, 0, 'user');
    return words.join('-');
  }

  async onModuleInit() {
    const kafkaEnv = process.env.KAFKA_ENV;
    // const autoOffsetReset = process.env.KAFKA_AUTO_OFFSET_RESET;

    const topics = [
      `post-like-${kafkaEnv}`,
      `diary-like-${kafkaEnv}`,
      `weather-reg-${kafkaEnv}`,
      `post-comment-${kafkaEnv}`,
      `post-report-${kafkaEnv}`,
      `diary-report-${kafkaEnv}`,
    ];

    await this.consumerService.consume(
      {
        topics: [...topics],
        // fromBeginning: autoOffsetReset === 'earliest',
      },
      {
        eachMessage: async ({ topic, partition, message }) => {
          const event = JSON.parse(message.value.toString());
          console.log(event);
          let sendTopic = '';
          try {
            sendTopic = await this.getSendTopic(topic);
            // 포스팅 좋아요 알림
            if (topic === topics[0]) {
              const postWriterId = event.user_id;
              const postWriter = await this.getUserById(postWriterId);
              const likeUserId = event.like_user_id;
              const likeUser = await this.getUserById(likeUserId);

              event.diary_writer_name = postWriter.name;
              event.diary_writer_profile_url = postWriter.profileUrl;
              event.like_user_name = likeUser.name;
              event.like_user_profile_url = likeUser.profileUrl;
              event.post_writer_fcm = postWriter.encryptedFCM;
            }
            // 다이어리 좋아요 알림
            if (topic === topics[1]) {
              const diaryWriterId = event.user_id;
              const diaryWriter = await this.getUserById(diaryWriterId);
              const likeUserId = event.like_user_id;
              const likeUser = await this.getUserById(likeUserId);

              event.diary_writer_name = diaryWriter.name;
              event.diary_writer_profile_url = diaryWriter.profileUrl;
              event.like_user_name = likeUser.name;
              event.like_user_profile_url = likeUser.profileUrl;
              event.diary_writer_fcm = diaryWriter.encryptedFCM;
            }
            // 날씨 등록 알림
            if (topic === topics[2]) {
              const allUsers = await this.getUsers();
              const userList = allUsers.map((item) => ({
                user_id: item.userId,
                user_name: item.name,
                profile_url: item.profileUrl,
                fcm_token: item.encryptedFCM,
              }));
              event.user_list = userList;
            }
            // 포스팅 댓글 등록 알림
            if (topic === topics[3]) {
              const userId = event.user_id;
              const commentUserId = event.comment_user_id;
              const user = await this.getUserById(userId);
              const commentUser = await this.getUserById(commentUserId);

              event.comment_user_name = commentUser.name;
              event.profile_url = commentUser.profileUrl;
              event.fcm_token = user.encryptedFCM;
            }
            // 포스팅 신고 알람
            if (topic === topics[4]) {
              const { reporting_user_id: reportingUserId, reported_user_id: reportedUserId } = event;
              const reportingUser = await this.getUserById(reportingUserId);
              const reportedUser = await this.getUserById(reportedUserId);

              event.reporting_user_name = reportingUser.name;
              event.reporting_user_profile_url = reportingUser.profileUrl;
              event.reported_user_name = reportedUser.name;
              event.reported_user_profile_url = reportedUser.profileUrl;
              event.reporting_user_fcm_token = reportingUser.encryptedFCM;
              event.reported_user_fcm_token = reportedUser.encryptedFCM;
            }
            // 다이어리 신고 알람
            if (topic === topics[5]) {
              const { reporting_user_id: reportingUserId, reported_user_id: reportedUserId } = event;
              const reportingUser = await this.getUserById(reportingUserId);
              const reportedUser = await this.getUserById(reportedUserId);

              event.reporting_user_name = reportingUser.name;
              event.reporting_user_profile_url = reportingUser.profileUrl;
              event.reported_user_name = reportedUser.name;
              event.reported_user_profile_url = reportedUser.profileUrl;
              event.reporting_user_fcm_token = reportingUser.encryptedFCM;
              event.reported_user_fcm_token = reportedUser.encryptedFCM;
            }
            console.log(event);
            if (sendTopic) {
              this.producerService.produce({
                topic: sendTopic,
                messages: [
                  {
                    value: JSON.stringify(event),
                  },
                ],
              });
            }
          } catch (e) {
            this.logger.error(e);
            throw e;
          }
        },
      },
    );
  }
}
