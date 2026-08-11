export interface LandingImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  author: string;
  sourceUrl: string;
}

export const landingImages = {
  residence: {
    src: "/images/ecoterra-demo/modern-residential-entrance.jpg",
    width: 1200,
    height: 1500,
    alt: "Entrada de una residencia contemporánea rodeada de vegetación, imagen ilustrativa.",
    author: "Alef Morais",
    sourceUrl: "https://unsplash.com/photos/modern-house-entrance-with-stone-wall-and-garden-qLJMuJkD4as",
  },
  access: {
    src: "/images/ecoterra-demo/residential-access-community.jpg",
    width: 1600,
    height: 1067,
    alt: "Acceso controlado a una comunidad residencial arbolada, imagen ilustrativa.",
    author: "Long Chung",
    sourceUrl: "https://unsplash.com/photos/a-gated-community-entrance-with-a-security-booth-BtLoUZ6Ic7I",
  },
} satisfies Record<string, LandingImage>;
