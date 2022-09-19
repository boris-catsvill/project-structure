import BaseEventState from "./BaseEventState";
import fetchJson from "../utils/fetch-json";

const BACKEND_URL = process.env.BACKEND_URL

export default class TableEventState extends BaseEventState {
  apiUrl = new URL(`${BACKEND_URL}/api/dashboard/`)
  
  isLoading = false
  data = []
  #additionalFilters = {}

  constructor(request = '') {
    super()
    this.apiUrl = new URL(`/api${request}`, this.apiUrl)
  }

  set additionalFilters(filters) {
    this.#additionalFilters = filters
  }

  get additionalFilters() {
    return this.#additionalFilters
  }

  async updateData(options, clearBefore = false) {
    this.startLoading()

    const request = this.makeRequest({ ...options, ...this.#additionalFilters })

    const data = await fetchJson(request)

    clearBefore 
      ? this.data = data
      : this.data.push(...data)
    
    this.finishLoading()
    this.dispatchEvent('updateData')
  }

  updateDataLocalSort(sorted, headerConfig) {
    const { fieldValue, orderValue } = sorted
    const { sortType } = headerConfig.find(col => col.id === fieldValue)
    const direction = { asc: 1, desc: -1 }

    const sorter = {
      string: (a, b) => 
        direction[orderValue] * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']),
      number: (a, b) => direction[orderValue] * (a[fieldValue] - b[fieldValue])
    }

    this.data.sort(sorter[sortType])
    this.dispatchEvent('updateData')
  }

  clearData() {
    this.data = []
  }

  startLoading() {
    this.isLoading = true
    this.dispatchEvent('startLoading')
  }

  finishLoading() {
    this.isLoading = false
    this.dispatchEvent('finishLoading')
  }

  makeRequest(query = {}) {
    const newRequest = new URL(this.apiUrl)
    Object.entries(query).forEach(([key, value]) => {
      if (value || value === 0)
        newRequest.searchParams.set(key, value)
    })
    return newRequest
  }
}

export const bestsellersTableState = new TableEventState('/dashboard/bestsellers')
export const productsTableState = new TableEventState('/rest/products')