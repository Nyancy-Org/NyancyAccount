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
export const isEmail = (email: string) => {
  if (!/^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,6})$/.test(email))
    throw new HttpException(
      {
        msg: '请输入正确的邮箱地址！',
      },
      HttpStatus.EXPECTATION_FAILED,
    );
  return true;
};

export const validatePassword = (passwd: string) => {
  if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|\\:;"'<>,.?/~`]{6,20}$/.test(passwd))
    throw new HttpException(
      {
        msg: '密码格式不正确',
      },
      HttpStatus.EXPECTATION_FAILED,
    );
  return true;
};

// 邮箱模板
export async function emailTemplate(type: string, v: string) {
  const file = `template/email/${type}.mjml`;
  const template = Handlebars.compile(await fs.readFile(file, 'utf8'));
  const output = mjml2html(template({ v, year: new Date().getFullYear() }));
  return output.html;
}

// base64 转 Uint8Array
export const base64ToUint8Array = (base64: string) => {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
};

// Uint8Array 转 base64
export const uint8ArrayToBase64 = (u8: Uint8Array) => {
  let binary = '';
  const bytes = [].slice.call(new Uint8Array(u8));
  bytes.forEach((b: any) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

export const validateSearchQuery = (_page: string, _pageSize: string) => {
  if (
    !_page ||
    _page === '0' ||
    !_pageSize ||
    _pageSize === '0' ||
    isNaN(Number(_page)) ||
    isNaN(Number(_pageSize)) ||
    Number(_page) <= 0 ||
    Number(_pageSize) < -2 ||
    Number(_pageSize) === 0
  )
    throw new HttpException(
      {
        msg: '参数有误',
      },
      HttpStatus.EXPECTATION_FAILED,
    );

  return {
    page: Number(_page),
    pageSize: Number(_pageSize),
  };
};
