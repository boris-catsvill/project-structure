import { imageUploaderState } from "../../../state/FileUploaderEventState"

import Input from "../Input"
import InputSelect from "../InputSelect"
import InputArea from "../InputArea"
import InputImage from "../InputImage"

const getFields = () => {
  const inputTitle = new Input({ 
    name: 'title',
    label: 'Название товара:', 
    placeholder: 'Название товара' 
  })
  
  const inputPrice = new Input({
    name: 'price',
    label: 'Цена ($)',
    type: 'number',
    placeholder: '00.00'
  })
  
  const inputImage = new InputImage({
    name: 'images'
  }, imageUploaderState)
  
  const inputDiscount = new Input({
    name: 'discount',
    label: 'Скидка ($)',
    type: 'number',
    placeholder: '00.00'
  })
  
  const inputQuantity = new Input({
    name: 'quantity',
    label: 'Количество',
    type: 'number',
    placeholder: '0'
  })
  
  const inputArea = new InputArea({
    name: 'description',
    label: 'Описание:', 
    placeholder: 'Описание товара'
  })
  
  const inputCategorySelect = new InputSelect({
    name: 'subcategory',
    label: 'Категория',
    options: []
  })
  
  const inputStatusSelect = new InputSelect({
    name: 'status',
    label: 'Статус',
    options: [
      { value: null, label: 'Выберите статус' },
      { value: '1', label: 'Активен' },
      { value: '0', label: 'Неактивен' }
    ]
  })
  
  return {
    inputTitle,
    inputPrice,
    inputDiscount,
    inputQuantity,
    inputArea,
    inputStatusSelect,
    inputCategorySelect,
    inputImage
  }
}

export default getFields