import Link from "next/link";
import { BRAND_ADDRESS, BRAND_CITY, BRAND_EMAIL, BRAND_PHONE, SITE_NAME } from "@/lib/seo";
import { pageMetadata } from "@/lib/page-metadata";
import { BUSINESS_ID, webPageSchema } from "@/lib/structured-data";
import { JsonLd } from "@/app/components/JsonLd";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";

const title = "Автоматизация бизнеса в Бишкеке — адрес и контакты";
const description = "Центр автоматизации бизнеса в Бишкеке: Кок-Жар, улица Мадиева 23/1. Телефон, WhatsApp и почта для подбора оборудования, настройки учета и интеграций.";
export const metadata = pageMetadata("/contacts", title, description);

export default function ContactsPage() {
  return (
    <main className="shell section solution-page">
      <Breadcrumbs items={[{ name: "Главная", path: "/" }, { name: "Контакты", path: "/contacts" }]} />
      <JsonLd data={{ ...webPageSchema("/contacts", title, description, "ContactPage"), mainEntity: { "@id": BUSINESS_ID } }} />
      <h1>Центр автоматизации бизнеса в Бишкеке: контакты</h1>
      <p>{SITE_NAME} — подбор оборудования и автоматизация магазинов, кафе, складов и сервисных предприятий в Кыргызстане.</p>
      <section>
        <h2>Адрес и связь</h2>
        <address style={{ fontStyle: "normal" }}>
          <p>{BRAND_CITY}, {BRAND_ADDRESS}</p>
          <p><a href={`tel:${BRAND_PHONE.replace(/\s+/g, "")}`}>{BRAND_PHONE}</a></p>
          <p><a href="https://wa.me/996559474999">Написать в WhatsApp</a></p>
          <p><a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a></p>
        </address>
        <p>Перед визитом свяжитесь с нами, чтобы согласовать время встречи и уточнить подъезд к адресу в Кок-Жаре.</p>
      </section>
      <section>
        <h2>С какими задачами можно обратиться</h2>
        <ul>
          <li><Link href="/solutions/avtomatizaciya-magazina">Запуск учета и кассового места магазина</Link>: товары, продажи и остатки.</li>
          <li><Link href="/solutions/avtomatizaciya-kafe-i-restoranov">Автоматизация кафе и ресторана</Link>: меню, заказы и склад.</li>
          <li><Link href="/catalog">Подбор торгового оборудования</Link>: проверка моделей и совместимости с вашей программой.</li>
          <li><Link href="/integrations">Интеграции учетной системы, CRM и сайта</Link>: состав обмена и условия подключения.</li>
        </ul>
      </section>
      <section>
        <h2>Проекты в Бишкеке и других городах Кыргызстана</h2>
        <p>Укажите город и адрес торговой точки. На консультации согласуем формат работы, необходимость выезда, подключение оборудования и обучение сотрудников. Условия доставки и выезда уточняются для конкретного проекта.</p>
      </section>
      <section>
        <h2>Что подготовить для расчета</h2>
        <p>Сообщите тип бизнеса, число касс и пользователей, название текущей программы и модели оборудования. Если учет ведется в таблицах, опишите объем товаров и нужные операции. По этим данным обсудим состав работ, сроки и стоимость.</p>
        <Link className="btn btn-primary" prefetch={false} href="/#request">Обсудить проект</Link>
      </section>
    </main>
  );
}
