import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, ProducerRecord, Partitioners } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private bootstrapServer: string = `${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`;

  private readonly kafka = new Kafka({
    brokers: [this.bootstrapServer],
  });
  private readonly producer: Producer = this.kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  async onModuleInit() {
    await this.producer.connect();
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
