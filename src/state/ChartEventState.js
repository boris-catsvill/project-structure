import BaseEventState from "./BaseEventState";
import fetchJson from '../utils/fetch-json'

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class ChartEventState extends BaseEventState {
  apiUrl = new URL(`${BACKEND_URL}/api/dashboard/`)
  range = { from: new Date(), to: new Date() }
  isLoading = false
  value = 0
  data = []

  constructor(request = '') {
    super()
    this.apiUrl = new URL(`/api/dashboard${request}`, this.apiUrl)
  }

  async updateChartRange(from, to) {
    this.startLoading()
    this.data = await this.fetchData(from, to)
    this.value = this.data.reduce((acc, curr) => acc + curr, 0)
    this.finishLoading()
    this.dispatchEvent('updateChartRange')
  }

  async fetchData(from = new Date(), to = new Date()) {
    const fromISO = from.toISOString()
    const toISO = to.toISOString()

    this.apiUrl.searchParams.set('from', fromISO)
    this.apiUrl.searchParams.set('to', toISO)

    const data = await fetchJson(this.apiUrl)
    return Object.values(data)
  } 

  startLoading() {
    this.isLoading = true
    this.dispatchEvent('startLoading')
  }

  finishLoading() {
    this.isLoading = false
    this.dispatchEvent('finishLoading')
  }
}

export const salesChartState = new ChartEventState('/sales')
export const ordersChartState = new ChartEventState('/orders')
export const customersChartState = new ChartEventState('/customers')