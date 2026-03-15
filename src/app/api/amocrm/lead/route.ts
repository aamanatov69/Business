import { NextResponse } from "next/server";

type LeadBody = {
  fullName: string;
  phone: string;
  email: string;
  businessType: string;
  website?: string;
};

const ALLOWED_BUSINESS_TYPES = new Set([
  "Магазин",
  "СТО",
  "Бильярд",
  "Кафе",
  "Баня",
]);

const CUSTOM_BUSINESS_TYPE_MIN_LENGTH = 2;
const CUSTOM_BUSINESS_TYPE_MAX_LENGTH = 80;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

function cleanExpiredRateLimitEntries(now: number) {
  for (const [ip, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(ip);
    }
  }
}

function checkRateLimit(ip: string) {
  const now = Date.now();

  if (rateLimitStore.size > 5000) {
    cleanExpiredRateLimitEntries(now);
  }

  const existingBucket = rateLimitStore.get(ip);

  if (!existingBucket || existingBucket.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return true;
  }

  if (existingBucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  existingBucket.count += 1;
  rateLimitStore.set(ip, existingBucket);

  return true;
}

function getOptionalNumberEnv(name: string) {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return undefined;
  }

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function createTextCustomField(fieldId: number | undefined, value: string) {
  if (!fieldId) {
    return null;
  }

  return {
    field_id: fieldId,
    values: [{ value }],
  };
}

function extractLeadId(payload: unknown) {
  if (Array.isArray(payload) && typeof payload[0]?.id === "number") {
    return payload[0].id;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "_embedded" in payload &&
    payload._embedded &&
    typeof payload._embedded === "object" &&
    "leads" in payload._embedded &&
    Array.isArray(payload._embedded.leads) &&
    typeof payload._embedded.leads[0]?.id === "number"
  ) {
    return payload._embedded.leads[0].id;
  }

  return undefined;
}

function buildLeadNoteText(params: {
  fullName: string;
  phone: string;
  email: string;
  businessType: string;
  now: string;
}) {
  return [
    "Здравствуйте, расскажите об автоматизации этого бизнеса.",
    "",
    `Тип бизнеса: ${params.businessType}`,
    `Клиент: ${params.fullName}`,
    `Телефон: ${params.phone}`,
    `Email: ${params.email}`,
    `Дата заявки: ${params.now}`,
  ].join("\n");
}

async function createLeadNote(params: {
  webhookUrl: string;
  headers: Record<string, string>;
  leadId: number;
  text: string;
}) {
  const notesUrl = new URL("/api/v4/leads/notes", params.webhookUrl).toString();

  return fetch(notesUrl, {
    method: "POST",
    headers: params.headers,
    body: JSON.stringify([
      {
        entity_id: params.leadId,
        note_type: "common",
        params: {
          text: params.text,
        },
      },
    ]),
    cache: "no-store",
  });
}

function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export async function POST(request: Request) {
  const webhookUrl = process.env.AMOCRM_WEBHOOK_URL?.trim();
  const clientIp = getClientIp(request);

  if (!webhookUrl) {
    return NextResponse.json(
      {
        message:
          "Не настроен AMOCRM_WEBHOOK_URL. Укажите URL amoCRM, например https://YOUR_SUBDOMAIN.amocrm.ru/api/v4/leads/complex.",
      },
      { status: 500 },
    );
  }

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      {
        message:
          "Слишком много запросов. Пожалуйста, повторите попытку через несколько минут.",
      },
      { status: 429 },
    );
  }

  let body: LeadBody;

  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return badRequest("Некорректное тело запроса.");
  }

  const fullName = body.fullName?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();
  const businessType = body.businessType?.trim();
  const website = body.website?.trim();

  // Honeypot: silently accept bot submissions without sending anything to CRM.
  if (website) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!fullName) {
    return badRequest("Поле ФИО обязательно.");
  }

  if (!/^\+996\s\d{3}\s\d{2}\s\d{2}\s\d{2}$/.test(phone)) {
    return badRequest("Телефон должен быть в формате +996 000 00 00 00.");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return badRequest("Некорректный email.");
  }

  if (!businessType) {
    return badRequest("Выберите тип бизнеса.");
  }

  const isKnownBusinessType = ALLOWED_BUSINESS_TYPES.has(businessType);

  if (!isKnownBusinessType) {
    if (
      businessType.length < CUSTOM_BUSINESS_TYPE_MIN_LENGTH ||
      businessType.length > CUSTOM_BUSINESS_TYPE_MAX_LENGTH
    ) {
      return badRequest("Укажите корректный тип бизнеса.");
    }

    if (!/^[\p{L}\p{N}\s().,-]+$/u.test(businessType)) {
      return badRequest("Тип бизнеса содержит недопустимые символы.");
    }
  }

  const now = new Date().toLocaleString("ru-RU", { timeZone: "Asia/Bishkek" });
  const leadNoteText = buildLeadNoteText({
    fullName,
    phone,
    email,
    businessType,
    now,
  });
  const leadCustomFields = [
    createTextCustomField(
      getOptionalNumberEnv("AMOCRM_SOURCE_FIELD_ID"),
      "Сайт",
    ),
    createTextCustomField(
      getOptionalNumberEnv("AMOCRM_REQUEST_DATE_FIELD_ID"),
      now,
    ),
    createTextCustomField(
      getOptionalNumberEnv("AMOCRM_BUSINESS_TYPE_FIELD_ID"),
      businessType,
    ),
  ].filter((field) => field !== null);

  const leadPayload = [
    {
      name: `Запрос на автоматизацию: ${businessType} (${fullName})`,
      ...(getOptionalNumberEnv("AMOCRM_PIPELINE_ID")
        ? { pipeline_id: getOptionalNumberEnv("AMOCRM_PIPELINE_ID") }
        : {}),
      ...(getOptionalNumberEnv("AMOCRM_STATUS_ID")
        ? { status_id: getOptionalNumberEnv("AMOCRM_STATUS_ID") }
        : {}),
      _embedded: {
        contacts: [
          {
            name: fullName,
            custom_fields_values: [
              {
                field_code: "PHONE",
                values: [{ value: phone, enum_code: "WORK" }],
              },
              {
                field_code: "EMAIL",
                values: [{ value: email, enum_code: "WORK" }],
              },
            ],
          },
        ],
      },
      ...(leadCustomFields.length > 0
        ? { custom_fields_values: leadCustomFields }
        : {}),
    },
  ];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (process.env.AMOCRM_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.AMOCRM_ACCESS_TOKEN}`;
  }

  const amoResponse = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(leadPayload),
    cache: "no-store",
  });

  if (!amoResponse.ok) {
    const details = await amoResponse.text();
    console.error("amoCRM lead create error", {
      status: amoResponse.status,
      details: details.slice(0, 800),
    });

    return NextResponse.json(
      {
        message: "amoCRM вернул ошибку при создании заявки.",
      },
      { status: 502 },
    );
  }

  const amoPayload = (await amoResponse.json().catch(() => null)) as unknown;
  const leadId = extractLeadId(amoPayload);

  if (!leadId) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const noteResponse = await createLeadNote({
    webhookUrl,
    headers,
    leadId,
    text: leadNoteText,
  });

  if (!noteResponse.ok) {
    const details = await noteResponse.text();
    console.error("amoCRM note create error", {
      status: noteResponse.status,
      details: details.slice(0, 800),
      leadId,
    });

    return NextResponse.json(
      {
        ok: true,
        warning: "Сделка создана, но примечание с текстом заявки не добавлено.",
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
