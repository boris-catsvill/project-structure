

// throws FetchError if upload failed
export default class ImageUploader {
  constructor(IMGUR_CLIENT_ID) {
    this.IMGUR_CLIENT_ID = IMGUR_CLIENT_ID;
  }

  async upload(file) {
    const formData = new FormData();

    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${this.IMGUR_CLIENT_ID}`
        },
        body: formData
      });

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
