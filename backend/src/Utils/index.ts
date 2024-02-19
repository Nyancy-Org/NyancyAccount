import { HttpException, HttpStatus } from '@nestjs/common';
import fs from 'fs-extra';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';

export const randomString = (length: number) => {
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numericChars = '0123456789';

  let randomString = '';

  // 添加一个小写字母
  randomString +=
    lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)];
  // 添加一个大写字母
  randomString +=
    upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)];
  // 添加一个数字
  randomString += numericChars[Math.floor(Math.random() * numericChars.length)];

  const remainingChars = lowerCaseChars + upperCaseChars + numericChars;

  for (let i = 3; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * remainingChars.length);
    randomString += remainingChars[randomIndex];
  }

  // 将字符串随机排序以确保随机性
  return randomString
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
};

export const objIsEmpty = (obj: object) => {
  return Object.values(obj).every((value) => value == null || value === '');
};

// 判断对象数据是否合法
export async function isSafeData(body: { [propName: string]: any }) {
  // const strReg = /^(?!.*[`"']).*$/;
  const strReg = /^[^`"'\x5C]*$/;
  for (const key in body) {
    if (Object.hasOwnProperty.call(body, key)) {
      const value = body[key] as string;
      if (!strReg.test(value)) {
        throw new Error('数据不合法！');
      }
      if (typeof value === 'object') {
        this.isSafeData(value);
      }
    }
  }
}

// 校验邮箱格式
export function isEmail(email: string) {
  if (!/^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,6})$/.test(email))
    throw new HttpException(
      {
        msg: '请输入正确的邮箱地址！',
      },
      HttpStatus.EXPECTATION_FAILED,
    );
}

// 邮箱模板
export async function emailTemplate(
  type: 'code' | 'link' | 'changeEmail',
  v: string,
) {
  const file = `template/email/${type}.mjml`;
  const template = Handlebars.compile(await fs.readFile(file, 'utf8'));
  const output = mjml2html(template({ v, year: new Date().getFullYear() }));
  return output.html;
}
