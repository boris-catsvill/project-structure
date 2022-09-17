import FormEventState from "./FormEventState";
import fetchJson from "../utils/fetch-json";

const BACKEND_URL = process.env.BACKEND_URL

export default class ProductFormEditState extends FormEventState {
  apiUrl = new URL(`${BACKEND_URL}api/rest/`)

  constructor() {
    super()
  }

  async saveProduct() {
    const product = this.getFormData()
  
    try {
      await fetchJson(`${this.apiUrl}products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      })
      
      this.dispatchEvent(new Event('saveProductSuccess'))
    } catch (error) {
      console.error('что-то пошло не так', error)
      this.dispatchEvent(new Event('saveProductFail'))
    }
  }

  async loadFormGoods() {
    const categoriesPromise = () =>  {
      const categoriesUrl = new URL('categories', this.apiUrl)
      categoriesUrl.searchParams.set('_sort', 'weight')
      categoriesUrl.searchParams.set('_refs', 'subcategory')
      return fetchJson(categoriesUrl)
    }

    const productDataPromise = () => {
      if (!this.productId) return [null]
      return fetchJson(`${this.apiUrl}products?id=${this.productId}`)
    }

    const promises = [categoriesPromise(), productDataPromise()]
    const [categories, [formData]] = await Promise.all(promises)

    if (formData) this.formData = formData

    return { categories }
  }

  getFormData() {
    const formPayload = {}
    
    const formatToNumber = ['status', 'price', 'discount', 'quantity']

    Object.entries(this.formState).forEach(([key, value]) => {        
      formPayload[key] = formatToNumber.includes(key) 
        ? parseInt(value)
        : value
    })

    this.productId && (formPayload.id = this.productId)

    return formPayload
  }
}

export const productFormEditState = new ProductFormEditState()