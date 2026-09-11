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

Для production-домена `automationbusines.com` используйте [SEO-отчет](deploy/SEO_AUDIT.md) и [HTTPS-шаблон nginx](deploy/nginx-production.conf.template). Основной адрес задается в `src/lib/site-origin.ts`. Инструкции ниже с `app.example.com` сохранены как пример установки на отдельном поддомене; перед применением сверяйте их с действующей конфигурацией сервера.

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

## Rosta Per-Client Integration (Backend + Admin UI)

Per-client Rosta access without sharing a global API key. An admin connects a client with just
a Rosta API Key from `/integrations/rosta`; tradepoints, warehouses, items, attributes and stock
are all fetched and linked automatically.

Data is stored in a server-side JSON database file:

- `data/app-db.json` (gitignored — contains encrypted API keys, never commit it)

Logical entities:

- `Client`: `id`, `name`, `rostaApiKeyEncrypted` (null once disconnected), `rostaApiKeyMasked`, `status` (`active`/`disabled`/`error`), `lastSyncAt`, `lastError`
- `RostaTradepoint`: `id`, `clientId`, `rostaTradepointId`, `name`, `warehouseId`, `updatedAt`
- `RostaWarehouse`: `id`, `clientId`, `rostaWarehouseId`, `name`, `tradepointId`, `isLimit`, `updatedAt`
- `RostaItem`: `id`, `clientId`, `rostaItemId`, `name`, `sku`, `article`, `barcode`, `category`, `image`, `price`, `unit`, `parentId`, `typeId`, `unitId`, `updatedAt`
- `RostaStock`: `id`, `clientId`, `warehouseId`, `itemId`, `attributeId`, `quantity`, `updatedAt`
- `RostaSyncLog`: `id`, `clientId`, `type` (`FULL_SYNC`/`STOCK_SYNC`), `status`, `startedAt`, `finishedAt`, `itemsProcessed`, `itemsUpdated`, `errorsCount`, `errorMessage`

Security:

- Raw Rosta API keys are encrypted at rest using `ROSTA_ENCRYPTION_KEY`; only a masked value
  (`••••••••••••••••a8F2`) is ever returned by an API route or shown in the admin UI.
- Every `/api/clients*` admin route (and the cron sync-all route) requires an
  `x-admin-token: <ROSTA_ADMIN_TOKEN>` header. Requests without a valid token get `401`.
  The public `/api/equipment/*` routes (homepage widget) are unauthenticated by design, same as before.
- Disconnecting a client (`DELETE /api/clients/{clientId}`) sets `status: disabled` and clears
  the encrypted API key, but keeps historical warehouse/item/stock/log rows.

Admin UI:

- `/integrations/rosta` - paste the admin token once (stored in the browser only), then connect
  a client with just its Rosta API Key, monitor status/counts/last sync, trigger manual sync,
  view recent sync history, and disconnect a client.

Routes (all require the `x-admin-token` header except the `equipment/*` ones):

- `GET /api/clients` - list clients with masked key, status, counts, last sync
- `POST /api/clients` - connect a new client: `{ name?, apiKey }` → validates the key, then runs
  the full tradepoints/warehouses/items/attributes/stock sync in one call
- `GET /api/clients/{clientId}` - client detail incl. tradepoints/warehouses
- `PATCH /api/clients/{clientId}` - rename / enable / disable
- `DELETE /api/clients/{clientId}` - disconnect (soft; keeps history)
- `POST /api/clients/{clientId}/rosta/connect` - re-run the full connect flow for an existing client
- `POST /api/clients/{clientId}/rosta/sync` - force catalog + stock sync ("Синхронизировать сейчас")
- `GET /api/clients/{clientId}/rosta/warehouses` - list client warehouses
- `GET /api/clients/{clientId}/rosta/tradepoints` - list client tradepoints
- `GET /api/clients/{clientId}/rosta/stock` - refresh and return stock for that client
- `GET /api/clients/{clientId}/logs?limit=20` - recent sync log entries
- `GET /api/clients/{clientId}/catalog?page=1&limit=24&search=&category=&warehouseId=` - catalog bundle
- `GET /api/clients/{clientId}/categories` - dynamic categories
- `GET /api/clients/{clientId}/products?page=1&limit=24&search=&category=&warehouseId=` - products list + pagination
- `GET /api/clients/{clientId}/products/{productId}` - one product
- `POST /api/integrations/rosta/sync-all` - syncs every non-disabled client sequentially; this is
  the endpoint a cron job/systemd timer should call for automatic periodic sync
- `GET /api/equipment/catalog`, `POST /api/equipment/sync`, `GET /api/equipment/stock` - unauthenticated
  homepage widget endpoints for the configured `ROSTA_DEFAULT_UI_CLIENT_ID`

Automatic sync (no in-process scheduler/queue exists, so it's driven by the OS). Example systemd
timer on the same VPS as the app:

```ini
# /etc/systemd/system/rosta-sync.service
[Unit]
Description=Rosta sync-all

[Service]
Type=oneshot
ExecStart=/usr/bin/curl -fsS -X POST https://app.example.com/api/integrations/rosta/sync-all \
  -H "x-admin-token: %E{ROSTA_ADMIN_TOKEN}"
```

```ini
# /etc/systemd/system/rosta-sync.timer
[Unit]
Description=Run Rosta sync-all every 5 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
```

Enable with `sudo systemctl enable --now rosta-sync.timer`. A plain crontab entry
(`*/5 * * * * curl -fsS -X POST ... -H "x-admin-token: ..."`) works just as well.

Required env:

```env
ROSTA_ENCRYPTION_KEY=replace_with_long_random_secret
ROSTA_ADMIN_TOKEN=replace_with_long_random_secret
```

Optional env:

```env
ROSTA_REQUEST_TIMEOUT_MS=12000
ROSTA_MAX_RETRIES=2
ROSTA_STOCK_BATCH_SIZE=100
ROSTA_DEFAULT_UI_CLIENT_ID=
```

Notes:

- Stock requests are batched (`ROSTA_STOCK_BATCH_SIZE`) to avoid one request per item.
- List endpoints (tradepoints/warehouses/items/attributes) are paginated automatically until the
  upstream response reports no further page.
- Retries on `429`/`5xx` use exponential backoff (500ms, 1s, 2s, 4s, ... capped at 8s).
- If upstream response does not contain detectable stock quantity fields, service returns raw payload and warning instead of inventing values.
- There is no separate internal product catalog in this app to map Rosta items against — the
  synced Rosta items are the catalog shown on the homepage, so no barcode/SKU mapping step is needed.

- Откройте `https://app.example.com`
- Убедитесь, что `POST /api/amocrm/lead` возвращает `200` при валидной форме
- Проверьте логи: `journalctl -u business -f`
