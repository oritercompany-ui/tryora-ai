import softRose from '../assets/softrose.jpg'
import nudeBloom from '../assets/nudebloom.jpg'
import berryGlow from '../assets/berryglow.jpg'
import classicRouge from '../assets/classicrouge.jpg'
import rosyBlush from '../assets/rosyblush.jpg'
import peachGlow from '../assets/peachglow.jpg'
import softBrown from '../assets/softbrown.jpg'
import champagne from '../assets/champagne.jpg'

export interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: string
  image: string
  effect: {
    category: string
    color: string
    intensity: number
    texture: string
  }
}

export const products: Product[] = [
  // =====================================================
  // LIP COLOR
  // =====================================================

  {
    id: 1,
    name: 'Soft Rose',
    brand: 'TRYORA BEAUTY',
    category: 'Lip Color',
    price: '$24',
    image: softRose,
    effect: {
      category: 'lip_color',
      color: '#E96B83',
      intensity: 70,
      texture: 'matte',
    },
  },

  {
    id: 2,
    name: 'Nude Bloom',
    brand: 'TRYORA BEAUTY',
    category: 'Lip Color',
    price: '$26',
    image: nudeBloom,
    effect: {
      category: 'lip_color',
      color: '#B97868',
      intensity: 65,
      texture: 'matte',
    },
  },

  {
    id: 3,
    name: 'Berry Glow',
    brand: 'TRYORA BEAUTY',
    category: 'Lip Color',
    price: '$28',
    image: berryGlow,
    effect: {
      category: 'lip_color',
      color: '#9E3159',
      intensity: 75,
      texture: 'matte',
    },
  },

  {
    id: 4,
    name: 'Classic Rouge',
    brand: 'TRYORA BEAUTY',
    category: 'Lip Color',
    price: '$25',
    image: classicRouge,
    effect: {
      category: 'lip_color',
      color: '#C9364F',
      intensity: 80,
      texture: 'matte',
    },
  },

  // =====================================================
  // BLUSH
  // =====================================================

  {
    id: 5,
    name: 'Rosy Blush',
    brand: 'TRYORA BEAUTY',
    category: 'Blush',
    price: '$22',
    image: rosyBlush,
    effect: {
      category: 'blush',
      color: '#E88A9A',
      intensity: 65,
      texture: 'matte',
    },
  },

  {
    id: 6,
    name: 'Peach Glow',
    brand: 'TRYORA BEAUTY',
    category: 'Blush',
    price: '$23',
    image: peachGlow,
    effect: {
      category: 'blush',
      color: '#F2A07B',
      intensity: 60,
      texture: 'matte',
    },
  },

  // =====================================================
  // EYESHADOW
  // =====================================================

  {
    id: 7,
    name: 'Soft Brown',
    brand: 'TRYORA BEAUTY',
    category: 'Eyeshadow',
    price: '$27',
    image: softBrown,
    effect: {
      category: 'eye_shadow',
      color: '#8B5E4A',
      intensity: 65,
      texture: 'matte',
    },
  },

  {
    id: 8,
    name: 'Champagne Shine',
    brand: 'TRYORA BEAUTY',
    category: 'Eyeshadow',
    price: '$29',
    image: champagne,
    effect: {
      category: 'eye_shadow',
      color: '#D9B47A',
      intensity: 70,
      texture: 'matte',
    },
  },
]