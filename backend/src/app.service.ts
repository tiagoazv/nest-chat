import { Injectable } from '@nestjs/common';
import { NatsProvider } from './broker/broker-server';

@Injectable()
export class AppService {
  constructor() {}
}
