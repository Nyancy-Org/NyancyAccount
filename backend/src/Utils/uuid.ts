import { v4, v5 } from 'uuid';

export function timeUuid() {
  let uuid = v4().replace(/-/gim, '');
  const t = new Date().getTime() + '';
  uuid = uuid + t;
  return uuid;
}

export function createUuid(num: number) {
  return v5(String(num), '1b671a64-40d5-491e-99b0-da01ff1f3341');
}
