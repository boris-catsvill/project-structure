import Input from "../Input"
import InputSelect from "../InputSelect"

const inputTitle = new Input({ 
  name: 'title',
  label: 'Сортировать по:', 
  placeholder: 'Название товара' 
})
const inputPriceFrom = new Input({ 
  name: 'priceFrom',
  label: 'Цена от:', 
  placeholder: '00.00',
  type: 'number' 
})
const inputPriceTo = new Input({ 
  name: 'priceTo',
  label: 'До:', 
  placeholder: '00.00',
  type: 'number' 
})
const inputStatus = new InputSelect({
  name: 'status',
  label: 'Статус:',
  options: [
    { label: 'Любой', value: '' },
    { label: 'Активный', value: '1' },
    { label: 'Неактивный', value: '0' }
  ]
})

export const Fields = {
  inputTitle,
  inputPriceFrom,
  inputPriceTo,
  inputStatus
}