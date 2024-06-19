import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka } from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private bootstrapServer: string = `${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`;

  private readonly kafka = new Kafka({
    brokers: [this.bootstrapServer],
  });
  private readonly consumers: Consumer[] = [];

  async consume(topics: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    const consumer = this.kafka.consumer({ groupId: 'nestjs-kafka' });
    await consumer.connect(); // 접속
    await consumer.subscribe(topics); // 구독
    await consumer.run(config); // 메세지 수신 뱅뱅이
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
