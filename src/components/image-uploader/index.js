const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

export default class ImageUploader {
  element;
  input;

  onUpload = async () => {
    try {
      const [file] = this.input.files;
      if (!file) return;
      this.element.classList.add('is-loading');
      this.element.disabled = true;
      const imageInfo = await this.upload(file);

      const newEvent = new CustomEvent('image-uploaded', {
        detail: {
          image: {
            url: imageInfo.data.link,
            source: file.name
          }
        }
      });
      this.element.dispatchEvent(newEvent);
    } catch (error) {
      alert('Ошибка загрузки изображения');
      console.error(error);
    }
    this.element.classList.remove('is-loading');
    this.element.disabled = false;
  };

  constructor() {
    this.input = this.getFileInput();
    this.render();
    this.initListeners();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  getTemplate() {
    return `
    <button type="button" name="uploadImage" class="button-primary-outline fit-content">
      <span>Загрузить</span>
    </button>
    `;
  }

  initListeners() {
    this.element.addEventListener('click', () => this.input.click());
    this.input.addEventListener('change', this.onUpload);
  }

  getFileInput() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <input type="file" accept="image/*">
    `;
    return wrapper.firstElementChild;
  }

  async upload(file) {
    const formData = new FormData();

    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData,
        referrer: ''
      });

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  remove() {
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.form = null;
  }
}
