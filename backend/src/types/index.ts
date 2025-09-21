export interface NyaResponse<T> {
  code: number;
  msg: string;
  data: T;
  time?: number;
  path?: string;
}
