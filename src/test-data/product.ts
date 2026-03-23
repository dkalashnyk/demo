export interface ProdItem {
  name: string;
  description: string;
  price: string;
  img: string;
  tax: string;
  total: string;
}

export const PRODUCTS = {
  TC02: {
    name: 'Sauce Labs Fleece Jacket',
    description:
      "It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.",
    price: '$49.99',
    img: 'Sauce Labs Fleece Jacket',
    tax: '$4.00',
    total: '$53.99',
  } satisfies ProdItem,
  TC03: {
    name: 'Sauce Labs Bolt T-Shirt',
    description:
      'Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.',
    price: '$15.99',
    img: 'Sauce Labs Bolt T-Shirt',
    tax: '$1.28',
    total: '$17.27',
  } satisfies ProdItem,
} as const;
