import Input from "../Input"
import InputSelect from "../InputSelect"
import InputArea from "../InputArea"

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
  name: 'category',
  label: 'Категория',
  options: []
})

const inputStatusSelect = new InputSelect({
  name: 'status',
  label: 'Статус',
  options: [
    { value: '1', label: 'Активен'},
    { value: '0', label: 'Неактивен'}
  ]
})

export const Fields = {
  inputTitle,
  inputPrice,
  inputDiscount,
  inputQuantity,
  inputArea,
  inputStatusSelect,
  inputCategorySelect
}