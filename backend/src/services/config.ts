// 读取配置文件
import { Logger } from '@nestjs/common';
import fs from 'fs-extra';

const AppConfig = {
  httpPort: 1239,
  database: {
    host: '',
    user: '',
    password: '',
    database: '',
  },
  isReverseProxy: false,
  isCdn: false,
  smtpConfig: {
    host: '',
    port: 465,
    auth: {
      user: '',
      pass: '',
    },
  },
  webAuthn: {
    rpName: '网站名称',
    rpID: '网站域名，例如 example.com',
    expectedOrigin: '完整的前端网页url，例如 http://example.com:8080',
  },
  ipip: {
    enable: false,
    dbPath: './ipipfree.ipdb',
  },
};

export default (() => {
  if (fs.existsSync('config.json')) {
    return JSON.parse(
      fs.readFileSync('config.json', 'utf8'),
    ) as typeof AppConfig;
  } else {
    Logger.warn('未检测到配置文件，正在尝试自动创建...');
    fs.writeFileSync('config.json', JSON.stringify(AppConfig, null, 2));
    return JSON.parse(
      fs.readFileSync('config.json', 'utf8'),
    ) as typeof AppConfig;
  }
})();
