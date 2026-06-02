export const SITE_URL = "https://vazovrifles.bg"; // TODO: replace with the final production domain before launch if different.
export const SITE_NAME = "Vazov Rifles";
export const OG_IMAGE = "/images/custom-upgrade.png";
export const ABSOLUTE_OG_IMAGE = `${SITE_URL}${OG_IMAGE}`;

export const AIRSOFT_DISCLAIMER =
  "Vazov Rifles работи с airsoft реплики, спортна еърсофт екипировка, custom конфигурации и сервиз. Не предлагаме реални огнестрелни оръжия.";

export const LEGAL_DRAFT_NOTE =
  "Този текст е информационна структура и трябва да бъде прегледан от юрист или компетентен консултант преди финално публикуване.";

export type PublicRoute =
  | "/"
  | "/custom-builds"
  | "/service"
  | "/contact"
  | "/inventory"
  | "/terms"
  | "/privacy-policy"
  | "/returns"
  | "/delivery-payment"
  | "/warranty"
  | "/service-terms"
  | "/custom-order-terms"
  | "/gunsmith-3d";

export const pageMeta: Record<PublicRoute, { title: string; description: string }> = {
  "/": {
    title: "Vazov Rifles | Еърсофт реплики, custom builds и сервиз в България",
    description:
      "Премиум еърсофт екипировка, custom реплики, сервиз, поддръжка и консултация за milsim и airsoft играчи в България.",
  },
  "/custom-builds": {
    title: "Custom Airsoft Builds | Vazov Rifles",
    description:
      "Индивидуални airsoft build-ове според стил на игра, бюджет и желана визия.",
  },
  "/service": {
    title: "Airsoft сервиз и поддръжка | Vazov Rifles",
    description:
      "Диагностика, ремонт, профилактика и настройка на еърсофт реплики.",
  },
  "/contact": {
    title: "Контакт | Vazov Rifles",
    description:
      "Изпратете запитване за наличности, custom build, сервиз или консултация.",
  },
  "/inventory": {
    title: "Наличности | Vazov Rifles",
    description:
      "Актуални наличности и gear предложения от Vazov Rifles. Изпратете запитване за конкретен продукт или setup.",
  },
  "/terms": {
    title: "Общи условия | Vazov Rifles",
    description:
      "Общи условия за използване на сайта Vazov Rifles и заявяване на airsoft услуги, екипировка и custom поръчки.",
  },
  "/privacy-policy": {
    title: "Политика за поверителност | Vazov Rifles",
    description:
      "Информация за обработката на лични данни при използване на сайта Vazov Rifles и изпращане на запитвания.",
  },
  "/returns": {
    title: "Връщане и рекламации | Vazov Rifles",
    description:
      "Информация за връщане, рекламации и обслужване на поръчки, свързани с airsoft екипировка и услуги.",
  },
  "/delivery-payment": {
    title: "Доставка и плащане | Vazov Rifles",
    description:
      "Информация за доставка, плащане и обработка на заявки към Vazov Rifles.",
  },
  "/warranty": {
    title: "Гаранция | Vazov Rifles",
    description:
      "Информация за гаранционни условия при продукти, сервиз и custom airsoft услуги.",
  },
  "/service-terms": {
    title: "Условия за сервиз | Vazov Rifles",
    description:
      "Условия за диагностика, профилактика, ремонт и поддръжка на airsoft реплики.",
  },
  "/custom-order-terms": {
    title: "Условия за custom поръчки | Vazov Rifles",
    description:
      "Условия за индивидуални custom airsoft build-ове, конфигурации и специални заявки.",
  },
  "/gunsmith-3d": {
    title: "3D Airsoft конфигуратор | Vazov Rifles",
    description:
      "Интерактивен 3D преглед на airsoft сетъп, аксесоари и конфигурации.",
  },
};

export const publicRoutes = Object.keys(pageMeta) as PublicRoute[];
