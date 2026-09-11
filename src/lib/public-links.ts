export function publicLinkLabel(path: string) {
  const labels: Record<string, string> = {
    "/catalog": "Каталог оборудования", "/catalog/pos-terminaly": "POS-терминалы",
    "/solutions/rosta": "Rosta для магазина", "/solutions/amocrm": "Внедрение amoCRM",
    "/solutions/avtomatizaciya-magazina": "Автоматизация магазина",
    "/solutions/pos-terminaly-i-kassy": "POS-системы и кассы",
    "/solutions/avtomatizaciya-sklada-i-ucheta": "Складской учет",
    "/integrations/rosta-connect": "Подключение Rosta", "/integrations/rosta-site": "Интеграция Rosta с сайтом",
    "/integrations/rosta-amocrm": "Обмен между Rosta и amoCRM", "/integrations/pos-bank": "Интеграция кассы с банковским терминалом",
    "/integrations/api": "API-интеграции", "/integrations": "Интеграции", "/contacts": "Контакты", "/blog": "Блог",
  };
  return labels[path] || "Решения для бизнеса";
}
