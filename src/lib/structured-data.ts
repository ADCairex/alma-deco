import type { Product } from "@/types";

import { formatProductPrice, getProductSeoDescription } from "@/lib/shop-products";

type SiteContext = {
  siteUrl: string;
};

type ProductStructuredDataInput = SiteContext & {
  path: string;
  imageUrl?: string | null;
  product: Pick<Product, "name" | "description" | "category" | "price" | "currency" | "stock">;
};

function toAbsoluteUrl(siteUrl: string, path: string) {
  return new URL(path, siteUrl).toString();
}

export function getOrganizationStructuredData({ siteUrl }: SiteContext) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Alma Deco",
    url: siteUrl,
    email: "info@almadeco.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ES",
      addressLocality: "España",
    },
  };
}

export function getWebsiteStructuredData({ siteUrl }: SiteContext) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Alma Deco",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function getProductStructuredData({ product, siteUrl, path, imageUrl }: ProductStructuredDataInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: getProductSeoDescription(product),
    category: product.category,
    image: imageUrl ? [imageUrl] : undefined,
    brand: {
      "@type": "Brand",
      name: "Alma Deco",
    },
    offers: {
      "@type": "Offer",
      url: toAbsoluteUrl(siteUrl, path),
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
      priceSpecification: {
        "@type": "PriceSpecification",
        price: product.price.toFixed(2),
        priceCurrency: product.currency,
        valueAddedTaxIncluded: true,
      },
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Precio mostrado",
        value: formatProductPrice(product.price, product.currency),
      },
    ],
  };
}
