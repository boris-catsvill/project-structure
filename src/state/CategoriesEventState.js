import BaseEventState from "./BaseEventState"
import fetchJson from '../utils/fetch-json'

const BACKEND_URL = process.env.BACKEND_URL

export const CATEGORY_STATE_ACTIONS = {
  startLoading: 'startLoading',
  finishLoading: 'finishLoading',
  updateCategories: 'updateCategories'
}

export default class CategoriesEventState extends BaseEventState {
  apiUrl = new URL(`${BACKEND_URL}`)

  isLoading = false

  categoriesList = []
  subcategoriesMap = {}

  constructor(request = '') {
    super()
    this.apiUrl = new URL(`/api${request}`, this.apiUrl)
  }

  async updateCategories(options) {
    this.startLoading()

    const request = this.makeRequest({ ...options })

    const data = await fetchJson(request)

    const getCategoryInfo = (category) => {
      if (!category) return {}
      const { id, count, title, subcategories } = category
      return { id, count, title, subcategories }
    }

    data.forEach(category => {
      const categoryInfo = getCategoryInfo(category)
      const { id, subcategories } = categoryInfo
      this.categoriesList.push(categoryInfo)
      subcategories?.forEach(subCategory => {
        const subCategoryInfo = getCategoryInfo(subCategory)
        if (this.subcategoriesMap[id]) {
          this.subcategoriesMap[id].push(subCategoryInfo)
          return
        }
        this.subcategoriesMap[id] = [subCategoryInfo]
      })
    })

    this.finishLoading()

    this.dispatchEvent(CATEGORY_STATE_ACTIONS.updateCategories)
  }

  async updateSubcategoriesOrder(categoryId, subCategoriesIds) {
    const subcategoriesPayload = subCategoriesIds.map((id, idx) => {
      return { id, weight: idx + 1}
    })

    const subcategoriesUrl = new URL('/api/rest/subcategories', this.apiUrl)

    await fetchJson(subcategoriesUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subcategoriesPayload)
    })

  }

  startLoading() {
    this.isLoading = true
    this.dispatchEvent(CATEGORY_STATE_ACTIONS.startLoading)
  }

  finishLoading() {
    this.isLoading = false
    this.dispatchEvent(CATEGORY_STATE_ACTIONS.finishLoading)
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

export const categoriesState = new CategoriesEventState('/rest/categories')