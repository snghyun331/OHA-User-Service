import { Module } from '@nestjs/common';
import { ConsumerService } from './kafka.consumer.service';
import { ProducerService } from './kafka.producer.service';

@Module({
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService, ConsumerService],
})
export class KafkaModule {}
