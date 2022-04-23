import fetchJson from '../../../utils/fetch-json';

export default class FileUploader {
  url = new URL('3/image', 'https://api.imgur.com');

  handleChange = async event => {
    try {
      this.element.dispatchEvent(new CustomEvent('upload-loading'));

      const [file] = this.element.files;
      const result = await this.upload(file);

      if (result.success) {
        this.element.dispatchEvent(
          new CustomEvent('upload-success', {
            detail: {
              link: result.data.link,
              name: file.name
            }
          })
        );
      } else {
        throw new Error(result);
      }
    } catch (error) {
      this.element.dispatchEvent(new ErrorEvent('upload-error', error));
    } finally {
      this.remove();
    }
  };

  showModal = () => {
    document.body.append(this.element);
    this.element.click();
  };

  constructor() {
    this.render();
  }

  getInput() {
    return `<input type="file" accept="image/*" hidden>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getInput();

    this.element = wrapper.firstElementChild;
    this.initEventListeners(this.element);
  }

  initEventListeners(fileInput) {
    fileInput.addEventListener('change', this.handleChange);
  }

  async upload(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetchJson(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
      },
      body: formData,
      referrer: ''
    });

    return response;
  }

  remove() {
    if (this.element) {
      this.element.value = null;
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.instance = null;
  }
}
