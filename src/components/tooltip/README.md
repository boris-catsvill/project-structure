# Tooltip компонент

Необходимо реализовать компонент "Tooltip", который будет показывать всплывающую подсказку 
на элементах с data-атрибутом `data-tooltip` (необходимо использовать приём проектирования «поведение», 
подробнее в [учебнике](https://learn.javascript.ru/event-delegation#priyom-proektirovaniya-povedenie))

!["Tooltip"](tooltip.gif)

В проекте данный компонент будет использоваться на странице [main page](https://course-js.javascript.ru/)
в компонентах:
* "ColumnChart" - при наведении на колонки графика
* "BestSellers Table" - при наведении на название категории   

**Обратите внимание:**
 
* Очень важно в данном компоненте своевременно добавлять и очищать обработчики событий
* Данный компонент должен быть реализован через паттерн 
["Singleton"](https://ru.wikipedia.org/wiki/%D0%9E%D0%B4%D0%B8%D0%BD%D0%BE%D1%87%D0%BA%D0%B0_%28%D1%88%D0%B0%D0%B1%D0%BB%D0%BE%D0%BD_%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F%29)   

**Подсказка:**
Используйте события: `pointerover` и  `pointerout` - они всплывают

