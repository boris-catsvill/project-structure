import BaseEventState from "./BaseEventState";
import fetchJson from "../utils/fetch-json"

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';

export default class FileUploaderEventState extends BaseEventState {
  apiUrl = null

  isLoading = false

  files = []

  constructor(apiUrl) {
    super()

    this.apiUrl = apiUrl
  }

  async uploadFile(fieldName, file, touchid) {
    this.startLoading()

    const formData = new FormData()

    formData.append(fieldName, file);

    try {
      const image = await fetchJson(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        referrer: ''
      })

      const source = file.name
      const url = image.data.link

      this.files.push({ source, url, touchid})

      this.dispatchEvent('uploadFileSuccess')
    } catch(e) {
      this.dispatchEvent('uploadFileFail')
    }    

    this.finishLoading()
  }

  startLoading() {
    this.isLoading = true
    this.dispatchEvent('startLoading')
  }

  finishLoading() {
    this.isLoading = false
    this.dispatchEvent('finishLoading')
  }

  sortFiles(orderIds) {
    const newFileOrder = []
    orderIds.forEach(touchid => {
      const file = this.files.find(f => f.touchid === touchid)
      newFileOrder.push(file)
    })
    this.files = newFileOrder
  }

  getFilesInfoWith(...args) {
    return this.files.map((allFileInfo) => {
      const info = {}
      args.forEach(arg => (info[arg] = allFileInfo[arg]))
      return info
    })
  }
}

export const imageUploaderState = new FileUploaderEventState('https://api.imgur.com/3/image')