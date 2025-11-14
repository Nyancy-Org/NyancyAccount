import { Ip2Region } from 'ts-ip2region2';

export class Ip2RegionService {
  private static instance: Ip2RegionService;
  private readonly v4Searcher: Ip2Region;
  private readonly v6Searcher: Ip2Region;

  private constructor() {
    this.v4Searcher = new Ip2Region({
      cachePolicy: 'vectorIndex',
      ipVersion: 'v4',
    });
    this.v6Searcher = new Ip2Region({
      cachePolicy: 'vectorIndex',
      ipVersion: 'v6',
    });
  }

  static getInstance(): Ip2RegionService {
    if (!Ip2RegionService.instance) {
      Ip2RegionService.instance = new Ip2RegionService();
    }
    return Ip2RegionService.instance;
  }

  static isV4(ip: string) {
    return ip.split('.').length === 4;
  }

  private static formatIpInfo(ipInfo: string): string {
    if (!ipInfo) return 'Unknown';

    const parts = ipInfo.split('|');

    // 如果只有第一部分有值，后面都是0，则只返回第一部分
    if (
      parts.length >= 4 &&
      parts[1] === '0' &&
      parts[2] === '0' &&
      parts[3] === '0'
    ) {
      return parts[0];
    }

    // 否则返回所有非0部分，用-连接
    const nonZeroParts = parts.filter((part) => part !== '0' && part !== '');
    return nonZeroParts.join('-');
  }

  static search(ip: string) {
    const instance = Ip2RegionService.getInstance();
    const searcher = Ip2RegionService.isV4(ip)
      ? instance.v4Searcher
      : instance.v6Searcher;

    try {
      const { region } = searcher.search(ip);
      return Ip2RegionService.formatIpInfo(region);
    } catch {
      return 'Unknown';
    }
  }
}
