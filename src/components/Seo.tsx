import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ABSOLUTE_OG_IMAGE, pageMeta, PublicRoute, SITE_NAME, SITE_URL } from "@/lib/site";

const setMeta = (selector: string, attribute: "content" | "href", value: string) => {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
};

const Seo = () => {
  const { pathname } = useLocation();
  const route = (pathname in pageMeta ? pathname : "/") as PublicRoute;
  const meta = pageMeta[route];
  const canonical = `${SITE_URL}${route === "/" ? "/" : route}`;

  useEffect(() => {
    document.title = meta.title;

    setMeta('meta[name="description"]', "content", meta.description);
    setMeta('link[rel="canonical"]', "href", canonical);
    setMeta('meta[property="og:title"]', "content", meta.title);
    setMeta('meta[property="og:description"]', "content", meta.description);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[property="og:site_name"]', "content", SITE_NAME);
    setMeta('meta[property="og:image"]', "content", ABSOLUTE_OG_IMAGE);
    setMeta('meta[name="twitter:title"]', "content", meta.title);
    setMeta('meta[name="twitter:description"]', "content", meta.description);
    setMeta('meta[name="twitter:image"]', "content", ABSOLUTE_OG_IMAGE);
  }, [canonical, meta.description, meta.title]);

  return null;
};

export default Seo;
