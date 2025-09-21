import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NyaResponse } from 'src/types';

@Injectable()
export class MainService {
  indexGet(): Partial<NyaResponse<any>> {
    return {
      msg: '哇哦？',
      data: [
        {
          id: 1,
          name: 'Lazy',
          info: 'Author',
        },
      ],
    };
  }
  indexPost() {
    return {
      msg: '嗯哼？',
      data: [
        {
          id: 1,
          name: 'Lazy',
          info: 'Author',
        },
      ],
    };
  }
  indexAll() {
    throw new HttpException('fuck', HttpStatus.METHOD_NOT_ALLOWED);
    // throw new Error('fuck');
  }
}
