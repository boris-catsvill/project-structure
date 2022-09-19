import BaseEventState from "./BaseEventState";
import fetchJson from "../utils/fetch-json"

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';

export const FILE_UPLOADER_ACTIONS = {
  uploadFileSuccess: 'uploadFileSuccess',
  uploadFileFail: 'uploadFileFail',
  clearFiles: 'clearFiles',
  startLoading: 'startLoading',
  finishLoading: 'finishLoading',
  updateDefaultFiles: 'updateDefaultFiles'
}
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

      this.dispatchEvent(FILE_UPLOADER_ACTIONS.uploadFileSuccess)
    } catch(e) {
      this.dispatchEvent(FILE_UPLOADER_ACTIONS.uploadFileFail)
    }    

    this.finishLoading()
  }

  updateDefaultFiles(files) {
    if (!files) {
      this.files = []
      return
    }
    const filesWithTochid = files.map((file, idx) => ({
      ...file,
      touchid: `${new Date().getTime() + idx}`
    }))
    this.files = filesWithTochid
    this.dispatchEvent(FILE_UPLOADER_ACTIONS.updateDefaultFiles)
  }

  clearFiles() {
    this.files = []
    this.dispatchEvent(FILE_UPLOADER_ACTIONS.clearFiles)
  }

  startLoading() {
    this.isLoading = true
    this.dispatchEvent(FILE_UPLOADER_ACTIONS.startLoading)
  }

  finishLoading() {
    this.isLoading = false
    this.dispatchEvent(FILE_UPLOADER_ACTIONS.finishLoading)
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