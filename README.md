# Admin Dashboard

**Important!**

Для того, что бы запустить проект, используя webpack:

* nodejs >=16.13.1
* npm >= 7.10.0

Проект - это фронтенд часть типичной "Панели управления" для магазина товаров,
реализованная на vanila JavaScript. 

## Preview

[![preview](./preview.png)](https://project-structure/)

## Стек

* <img alt="javascript" width="26px" src="https://raw.githubusercontent.com/boris-catsvill/project-structure/master/tech-stack/javascript.png" /> Javascript
* <img alt="html" width="26px" src="https://raw.githubusercontent.com/boris-catsvill/project-structure/master/tech-stack/html.png" /> HTML
* <img alt="CSS" width="26px" src="https://raw.githubusercontent.com/boris-catsvill/project-structure/master/tech-stack/css.png" /> CSS
* Webpack
* Browser API

## Основные Подходы

* ООП подход. Каждый компонент на странице выражен классом, который обслуживает жизненный цикл компонента.
* Наследование - использовалось для реализации общего поведения между компонентами.
* паттерн Singleton - отлично подошел для компонента нотификации.
* MVC (не в чистом виде) - отделил бизнес логику от представления.
* Event-emmiter - пригодился когда нужно было динамически изменять страницу в ответ на действия пользователя.

## To start project in development mode:

* `npm install` - установит необходимые зависимости
* `npm run develop` - запустит "WebpackDevServer"

**Note:** Версии требуемые проектом указаны в `package.json` в поле `engines`

## To build project:

`npm run build` - "соберет" проект в "production" режиме.

## Teacher

**Владимир Шевчук**

* [<img alt="GitHub" width="18px" src="https://raw.githubusercontent.com/boris-catsvill/project-structure/master/tech-stack/github-logo.png" /> GitHub](https://github.com/dosandk)
* [<img alt="learn.javascript" width="18px" src="https://raw.githubusercontent.com/boris-catsvill/project-structure/master/tech-stack/learn-javascript-logo.png" /> learn.javascript](http://learn.javascript.ru/profile/v-shevchuk)
* [<img alt="Linkedin" width="18px" src="https://raw.githubusercontent.com/boris-catsvill/project-structure/master/tech-stack/linkedin-logo.png" /> Linkedin](https://www.linkedin.com/in/dosandk/)
