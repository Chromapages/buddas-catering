import { groq } from "next-sanity";

export const testimonialsQuery = groq`*[_type == "testimonial"] | order(date desc) {
  _id,
  author,
  role,
  content,
  rating
}`;

export const menuItemsQuery = groq`*[_type == "menuItem" && status == "active"] | order(category->order asc, order asc, name asc) {
  _id,
  name,
  "slug": slug.current,
  "category": category->{
    title,
    "slug": slug.current,
    type,
    description
  },
  description,
  priceTitle,
  price,
  "imageUrl": image.asset->url,
  modifiers[]->{ title, type, options },
  dietary,
  isBestseller,
  isFeatured,
  itemType,
  useCaseLabels,
  inclusionsSummary,
  selectionTitle,
  selectionItems,
  order,
  status
}`;

export const cateringPackagesQuery = groq`*[_type == "cateringPackage" && status == "active"] | order(category->order asc, order asc, name asc) {
  _id,
  name,
  "slug": slug.current,
  "category": category->{
    title,
    "slug": slug.current,
    type,
    description
  },
  description,
  startingAt,
  "imageUrl": image.asset->url,
  useCaseLabels,
  pricingTier,
  includedItems[]->{
    name,
    description,
    priceTitle,
    price,
    dietary,
    isBestseller,
    "imageUrl": image.asset->url
  },
  modifiers[]->{ title, type, options },
  order,
  status
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  phoneNumber,
  ogImage { asset->{ url }, alt },
  siteDescription,
  defaultMetaTitle,
  defaultMetaDescription
}`;

export const landingPageQuery = groq`*[_type == "landingPage"][0]{
  _id,
  hero {
    badge,
    headline,
    subheadline,
    ratingText,
    primaryCtaText,
    primaryCtaLink,
    secondaryCtaText,
    secondaryCtaLink,
    backgroundImage {
      asset->{ url }
    },
    features
  },
  menuPreview {
    badge,
    headline,
    subheadline
  },
  buildYourPlatter {
    badge,
    headline,
    subheadline
  },
  occasions {
    badge,
    headline,
    subheadline
  },
  howItWorks {
    badge,
    headline,
    subheadline
  },
  trust {
    badge,
    headline
  },
  faq {
    headline,
    subheadline
  },
  leadForm {
    headline,
    subheadline
  }
}`;
