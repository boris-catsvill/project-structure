# SortableList

Необходимо реализовать "SortableList" компонент - цель которого позволить перемещать элементы 
списка с помощью [Drag'n'Drop](https://learn.javascript.ru/mouse-drag-and-drop).

!["SortableTable v3"](sortable-list.gif)

В проекте данный компонент будет использоваться на страницах:
* [Категории](https://course-js.javascript.ru/categories)
* [Товары](https://course-js.javascript.ru/products/101-planset-lenovo-tab-e10-tb-x104l-32-gb-3g-lte-cernyj)

Компонент должен принимать массив DOM элементов и отображать его в виде списка на странице.

Дополнительно, "SortableList" компонент должен обладать функционалом удаления элементов из отображаемого
списка. 

Зона с помощью которой можно "захватить" элемент для перемещения должна быть помечена data-атрибутом
"data-grab-handle"

Зона с помощью которой можно удалить элемент должна быть помечена data-атрибутом "data-delete-handle"

