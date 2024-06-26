import { Eureka_Heartbeat_Interval, Eureka_Registery_Interval } from '../utils/constant';
import { Eureka } from 'eureka-js-client';

const env = process.env.NODE_ENV;

const appName = `USER-SERVICE${env === 'product' ? '-DEV' : ''}`;
const executeUrl = `${process.env.HOST}:${process.env.PORT1}`;

export const eurekaClient = new Eureka({
  instance: {
    app: appName,
    hostName: process.env.HOST,
    ipAddr: process.env.HOST,
    port: {
      $: process.env.PORT1,
      '@enabled': true,
    },
    vipAddress: appName,
    statusPageUrl: `http://${executeUrl}/info`,
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: process.env.Eureka_HOST,
    port: process.env.Eureka_PORT,
    servicePath: '/eureka/apps/',
    heartbeatInterval: Eureka_Heartbeat_Interval,
    registryFetchInterval: Eureka_Registery_Interval,
  },
});
