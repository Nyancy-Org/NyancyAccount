import { NyaResponse, StatisticRes } from '@/types'
import { axios } from '@/utils/request'

// 请求地址前缀
const baseURL = '/site'

// 获取站点统计数据
export const getStatisticApi = async () => {
  const { data }: { data: StatisticRes } = await axios.get(baseURL + '/statistic?t_=' + Date.now())
  return data
}
