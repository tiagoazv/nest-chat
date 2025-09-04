import { Injectable } from '@nestjs/common';
import { NatsProvider } from './modules/broker/broker-server';

@Injectable()
export class AppService {
  constructor() {}
}
