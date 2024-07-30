import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log(" for latest build ")
    return 'Hello World!';
  }
}
