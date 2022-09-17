import BaseComponent from "../BaseComponent"
import Input from "./Input"
import FileUploaderEventState from "../../state/FileUploaderEventState"
import SortableList from "../../components/sortable-list"
import escapeHtml from "../../utils/escape-html"

const imageSortableList = new SortableList({ items: [] })

export default class InputImage extends BaseComponent {
  #elementDOM = null

  #stateManager = null

  inputDOM = null

  onChange = () => {
    // для обратной совместимости с дефолтными инпутами
    const target = { value: this.#stateManager.getFilesInfoWith('source', 'url') }
    this.inputDOM.oninput({ target })
  }

  uploadFile = async (event) => {
    const [file] = event.target.files
    if (!file) return
    const touchid = this.touchid()
    this.#stateManager.uploadFile('image', file, touchid)
  }

  clickUploadBtn = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.click()
    fileInput.oninput = this.uploadFile
  }

  startLoading = () => {
    const { uploadBtn } = this.memoDOM.cache
    uploadBtn.classList.add('is-loading')
    uploadBtn.disabled = true
  }

  finishLoading = () => {
    const { uploadBtn } = this.memoDOM.cache
    uploadBtn.classList.remove('is-loading')
    uploadBtn.disabled = false
  }

  uploadFileSuccess = () => {
    const files = this.#stateManager.files
    const uploadedFile = files[files.length - 1]
    const { url, source, touchid } = uploadedFile
    const DOMListItem = this.createDOMElement(this.templateImg(url, source, touchid))
    imageSortableList.add(DOMListItem);

    this.onChange()
  }

  onSortFiles = () => {
    const imageListContainer = imageSortableList.element
    const orderIds = [...imageListContainer.childNodes].map((item) => {
      const img = item.querySelector('[data-image]')
      return img.dataset.touchid
    })
    this.#stateManager.sortFiles(orderIds)

    this.onChange()
  }

  constructor({
    name = '',
    ...props
  }, stateManager) {
    super(props)

    if (!(stateManager instanceof FileUploaderEventState))
      throw new Error('instance of InputImage need in instance of FileUploaderEventState')

    const inputInstance = new Input({})
    inputInstance.render()
    this.inputDOM = inputInstance.input

    this.name = name
    this.#stateManager = stateManager
    
    this.addChildrenComponent('imageSortableList', imageSortableList)
  }

  get element() {
    return this.#elementDOM
  }

  get input() {
    return this.inputDOM
  }

  render() {
    this.#elementDOM = this.createDOMElement(this.template())

    const listArrayDOMItems = this.getArrayDOMItems()

    imageSortableList.items = listArrayDOMItems

    this.memoDOM.memoizeDocument(this.#elementDOM)
    this.renderDOMChildren(this.#elementDOM)

    this.initEvents()
  }

  getArrayDOMItems() {
    return this.#stateManager.files.map(({ url, source, touchid }) => {
      this.createDOMElement(this.templateImg(url, source, touchid))
    })
  }

  touchid() {
    return `${new Date().getTime()}`
  }

  initEvents() {
    const { uploadBtn } = this.memoDOM.cache
    uploadBtn.addEventListener('click', this.clickUploadBtn)
    this.#stateManager.on('startLoading', this.startLoading)
    this.#stateManager.on('finishLoading', this.finishLoading)
    this.#stateManager.on('uploadFileSuccess', this.uploadFileSuccess)
    imageSortableList.element.addEventListener('sortlist', this.onSortFiles)
  }

  template() {
    return /*html*/`
      <div>
        <label class="form-label">Фото</label>

        <span data-mount="imageSortableList"></span>

        <button 
          data-memo="uploadBtn"
          type="button" 
          name="uploadImage" 
          class="button-primary-outline"
        >
          <span>Загрузить</span>
        </button>
      </div>
    `
  }

  templateImg(url, name, touchid) {
    return /*html*/`
      <li 
        class="products-edit__imagelist-item sortable-list__item"
        data-draggable
      >
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img 
            class="sortable-table__cell-img"  
            data-touchid="${touchid}"
            alt="${escapeHtml(name)}" 
            src="${escapeHtml(url)}" 
            data-image
          >
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>
    `
  }
}