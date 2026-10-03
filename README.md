[README.md](https://github.com/user-attachments/files/33002971/README.md)
# HTTP-сервер на чистому Node.js

Базовий HTTP-сервер на вбудованих модулях Node.js (`http`, `url`, `querystring`), без сторонніх бібліотек. Маршрутизація написана вручну.

## Встановлення та запуск

Потрібен Node.js 18 або новіший. Залежності встановлювати не потрібно.

```bash
node server.js
```

або

```bash
npm start
```

Сервер слухає порт `3000`. Порт можна змінити змінною середовища `PORT`:

```bash
# Linux / macOS
PORT=8080 node server.js

# Windows PowerShell
$env:PORT=8080; node server.js
```

Автоматичні перевірки всіх маршрутів і помилок:

```bash
npm test
```

## Структура проєкту

```
server.js          точка входу, запуск сервера
src/app.js         створення сервера, обробка помилок
src/router.js      маршрутизація
src/handlers.js    обробники маршрутів, валідація форми
src/http.js        відправлення відповідей, читання тіла запиту, HttpError
src/views.js       генерація HTML та екранування
test.js            автоматичні перевірки
```

## Маршрути

| Метод | Маршрут    | Опис                            | Відповідь |
|-------|------------|---------------------------------|-----------|
| GET   | `/`        | Головна сторінка                | 200, `Home` / `Welcome to the Home Page` |
| GET   | `/about`   | Про нас                         | 200, `About` / `Learn more about us` |
| GET   | `/contact` | Контакти                        | 200, `Contact` / `Get in touch` |
| POST  | `/submit`  | Обробка форми (`name`, `email`) | 200, 400 або 413 |

Інші адреси повертають 404. Відомий маршрут з непідтримуваним методом повертає 405 із заголовком `Allow`.

### Приклади (curl)

У Windows PowerShell використовуйте `curl.exe` замість `curl`.

**GET /**

```bash
curl -i http://localhost:3000/
```

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 160
X-Content-Type-Options: nosniff

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Home</title>
</head>
<body>
<h1>Home</h1>
<p>Welcome to the Home Page</p>
</body>
</html>
```

**GET /about** та **GET /contact** повертають аналогічні сторінки із заголовками `About` / `Contact` і текстами `Learn more about us` / `Get in touch`.

**POST /submit, коректні дані**

```bash
curl -i -X POST -d "name=Ivan&email=ivan@example.com" http://localhost:3000/submit
```

Відповідь: `200 OK`, сторінка з вмістом:

```html
<h1>Form Submitted</h1>
<p>Name: Ivan</p>
<p>Email: ivan@example.com</p>
```

**POST /submit, порожні поля**

```bash
curl -i -X POST -d "name=&email=" http://localhost:3000/submit
```

Відповідь: `400 Bad Request`, сторінка з повідомленням `Invalid form data`.

**Неіснуючий маршрут**

```bash
curl -i http://localhost:3000/unknown
```

Відповідь: `404 Not Found`, сторінка з повідомленням `Page Not Found`.

**Захист від XSS**

```bash
curl -X POST -d "name=<script>alert(1)</script>&email=a@b.c" http://localhost:3000/submit
```

У відповіді `<script>` буде екрановано як `&lt;script&gt;`.

## Коди відповідей

| Код | Коли |
|-----|------|
| 200 | Успішний запит |
| 400 | Порожні або відсутні `name` / `email`, повторювані поля, Content-Type не `application/x-www-form-urlencoded` (повідомлення `Invalid form data`) |
| 404 | Неіснуючий маршрут (`Page Not Found`) |
| 405 | Непідтримуваний метод для відомого маршруту |
| 413 | Тіло POST-запиту більше 1 МБ (`Payload Too Large`) |
| 500 | Непередбачена помилка (`Server Error`) |

## Заголовки відповідей

Кожна відповідь містить:

- `Content-Type: text/html; charset=utf-8`
- `Content-Length` (розмір тіла в байтах)
- `X-Content-Type-Options: nosniff`

## Обмеження реалізації

- Максимальний розмір тіла POST-запиту: **1 МБ**. Перевіряється за заголовком `Content-Length` і за фактично отриманими байтами; після перевищення з'єднання закривається.
- Підтримується лише формат `application/x-www-form-urlencoded`.
- Валідація полів: `name` і `email` не повинні бути порожніми (після видалення пробілів). Формат email не перевіряється.
- Приймається не більше 50 полів форми.
- Усі значення екрануються (`&`, `<`, `>`, `"`, `'`) перед виведенням у HTML.
- Дані форми ніде не зберігаються.
- Сервер працює по HTTP без шифрування (HTTPS не підтримується).
- Заголовки безпеки обмежені `X-Content-Type-Options`. CSP та інші не додаються.
