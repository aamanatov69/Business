# Business Landing

Лендинг на Next.js с формой заявки, которая отправляет лид в amoCRM через серверный маршрут `POST /api/amocrm/lead`.

## Запуск

```bash
npm install
npm run dev
```

Сайт откроется на `http://localhost:3000`.

## Подключение amoCRM

1. Создайте файл `.env.local` на основе `.env.example`.
2. Заполните обязательные переменные:

```env
AMOCRM_WEBHOOK_URL=https://YOUR_SUBDOMAIN.amocrm.ru/api/v4/leads/complex
AMOCRM_ACCESS_TOKEN=your_amocrm_access_token
AMOCRM_PIPELINE_ID=1234567
AMOCRM_STATUS_ID=7654321
```

3. Перезапустите dev-сервер после изменения env.

### Что делает каждая переменная

- `AMOCRM_WEBHOOK_URL` — URL, куда сервер отправляет сделку. Для API v4 обычно это `https://<subdomain>.amocrm.ru/api/v4/leads/complex`.
- `AMOCRM_ACCESS_TOKEN` — OAuth access token amoCRM. Если используете URL с уже встроенной авторизацией, этот токен можно не передавать.
- `AMOCRM_PIPELINE_ID` — ID воронки, куда попадет заявка.
- `AMOCRM_STATUS_ID` — ID этапа внутри воронки.

### Необязательные поля сделки

Если хотите сохранять доп. данные в пользовательские поля amoCRM, добавьте их ID:

```env
AMOCRM_SOURCE_FIELD_ID=111111
AMOCRM_REQUEST_DATE_FIELD_ID=222222
AMOCRM_BUSINESS_TYPE_FIELD_ID=333333
```

Маршрут передаст в эти поля:

- `AMOCRM_SOURCE_FIELD_ID` → `Сайт`
- `AMOCRM_REQUEST_DATE_FIELD_ID` → дата и время заявки
- `AMOCRM_BUSINESS_TYPE_FIELD_ID` → выбранный тип бизнеса

Если эти переменные не заданы, лид все равно будет создан без дополнительных полей.

### Где взять ID полей, воронки и этапа

- ID воронки и этапа удобно посмотреть через API amoCRM или в настройках воронок.
- ID пользовательских полей можно получить запросом к `GET /api/v4/leads/custom_fields`.

## Как проверить интеграцию

1. Запустите проект.
2. Отправьте форму на сайте.
3. Проверьте Network в браузере: запрос `POST /api/amocrm/lead` должен вернуть `200`.
4. Если amoCRM вернет ошибку, маршрут отдаст `details` с ответом CRM.

## Текущее поведение формы

Форма отправляет в amoCRM:

- название сделки: `Заявка с лендинга от <ФИО>`
- контакт с телефоном и email
- тип бизнеса в пользовательское поле, если указан `AMOCRM_BUSINESS_TYPE_FIELD_ID`

## Защита от спама

Маршрут `POST /api/amocrm/lead` включает базовую защиту:

- rate limit по IP (окно 10 минут)
- honeypot-поле `website` (скрытое поле для отсечения ботов)

Если лимит превышен, API вернет `429`.

## Деплой на VPS с поддоменом

Если на сервере уже работает основной сайт, этот лендинг можно поднять на другом порту и проксировать через отдельный `server_name`.

### 1. DNS

Создайте A-запись поддомена (например, `app.example.com`) на IP VPS.

### 2. Подготовка приложения

```bash
cd /var/www/business
npm ci
npm run build
```

Создайте файл окружения `/var/www/business/.env.production` (с `NEXT_PUBLIC_SITE_URL`, `AMOCRM_*` и другими переменными).

### 3. systemd-сервис

Используйте шаблон [deploy/business.service.template](deploy/business.service.template), сохраните как:

`/etc/systemd/system/business.service`

Далее:

```bash
sudo systemctl daemon-reload
sudo systemctl enable business
sudo systemctl start business
sudo systemctl status business
```

### 4. Nginx для поддомена

Используйте шаблон [deploy/nginx-subdomain.conf.template](deploy/nginx-subdomain.conf.template), замените `app.example.com` на ваш поддомен и сохраните как:

`/etc/nginx/sites-available/business`

Активируйте конфиг:

```bash
sudo ln -s /etc/nginx/sites-available/business /etc/nginx/sites-enabled/business
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL

```bash
sudo certbot --nginx -d app.example.com
```

### 6. Проверка

- Откройте `https://app.example.com`
- Убедитесь, что `POST /api/amocrm/lead` возвращает `200` при валидной форме
- Проверьте логи: `journalctl -u business -f`
