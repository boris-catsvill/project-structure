import fetchJson from './fetch-json';
import { IMGUR_CLIENT_ID } from '../constants';

const API_URL = 'https://api.imgur.com/3';

/**
 * Загружает изображение на сервер
 * @param {File} file
 * @return {Promise<Object>}
 */
export async function uploadImage(file) {
  const body = new FormData();
  body.append('image', file);

  return await apiCall('POST', '/upload', { body });
}

/**
 * Удаляет изображение
 * @param {string} deleteHash
 * @return {Promise<Object>}
 */
export async function deleteImage(deleteHash) {
  return await apiCall('DELETE', '/image/' + encodeURI(deleteHash));
}

/**
 * @param {String} method
 * @param {String} uri
 * @param {Object} params
 * @return {Promise<Object>}
 */
async function apiCall(method, uri, params = {}) {
  return await fetchJson(API_URL + uri, Object.assign({
    method: method,
    headers: {
      'Authorization': 'Client-ID ' + IMGUR_CLIENT_ID,
      'Accept': 'application/json'
    },
    referrer: ''
  }, params));
}
