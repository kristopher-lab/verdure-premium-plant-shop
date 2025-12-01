import type { Product } from './types';
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    name: 'Monstera Deliciosa',
    slug: 'monstera-deliciosa',
    description: 'Iconic for its large, glossy, heart-shaped leaves that develop characteristic splits or holes. A must-have for any plant enthusiast.',
    price: 3500,
    images: [
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=800',
      'https://images.unsplash.com/photo-1591348278463-88a421189ac8?q=80&w=800',
    ],
    category: 'Indoor',
    tags: ['Partial Shade', 'Air Purifying'],
    variants: [
      { id: 'var_01a', name: '6" Pot', sku: 'MD-S-01', price: 3500, inventory: 15 },
      { id: 'var_01b', name: '10" Pot', sku: 'MD-L-01', price: 6500, inventory: 8 },
    ],
  },
  {
    id: 'prod_02',
    name: 'Snake Plant',
    slug: 'sansevieria-trifasciata',
    description: 'Extremely hardy and low-maintenance, the Snake Plant features stiff, upright leaves and is known for its air-purifying qualities.',
    price: 2800,
    images: [
      'https://images.unsplash.com/photo-1593482892290-f549329980a8?q=80&w=800',
      'https://images.unsplash.com/photo-1609242598199-elsonb14689f?q=80&w=800',
    ],
    category: 'Indoor',
    tags: ['Low Light', 'Air Purifying', 'Pet-Friendly'],
    variants: [
      { id: 'var_02a', name: '4" Pot', sku: 'SP-S-02', price: 2800, inventory: 20 },
      { id: 'var_02b', name: '8" Pot', sku: 'SP-L-02', price: 5200, inventory: 10 },
    ],
  },
  {
    id: 'prod_03',
    name: 'Fiddle Leaf Fig',
    slug: 'ficus-lyrata',
    description: 'A trendy and dramatic plant with large, violin-shaped leaves. It makes a stunning statement piece in any bright room.',
    price: 7500,
    images: [
      'https://images.unsplash.com/photo-1584589167171-543706e47c18?q=80&w=800',
      'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?q=80&w=800',
    ],
    category: 'Indoor',
    tags: ['Full Sun', 'Partial Shade'],
    variants: [
      { id: 'var_03a', name: '3ft Tall', sku: 'FLF-M-03', price: 7500, inventory: 5 },
      { id: 'var_03b', name: '5ft Tall', sku: 'FLF-L-03', price: 15000, inventory: 3 },
    ],
  },
  {
    id: 'prod_04',
    name: 'Echeveria "Lola"',
    slug: 'echeveria-lola',
    description: 'A beautiful rosette-forming succulent with pale, silvery-green leaves that have a hint of pink and lavender. Perfect for sunny windowsills.',
    price: 1200,
    images: [
      'https://images.unsplash.com/photo-1520429308892-3541a623a05d?q=80&w=800',
      'https://images.unsplash.com/photo-1587397279439-694143523380?q=80&w=800',
    ],
    category: 'Succulents',
    tags: ['Full Sun'],
    variants: [
      { id: 'var_04a', name: '2" Pot', sku: 'ECH-S-04', price: 1200, inventory: 30 },
    ],
  },
  {
    id: 'prod_05',
    name: 'Pothos "Marble Queen"',
    slug: 'epipremnum-aureum-marble-queen',
    description: 'A popular and easy-to-care-for vining plant with heart-shaped leaves variegated with creamy white. Great for hanging baskets.',
    price: 2200,
    images: [
      'https://images.unsplash.com/photo-1622383439233-0c21a13c133a?q=80&w=800',
      'https://images.unsplash.com/photo-1600415918422-a1896b291c36?q=80&w=800',
    ],
    category: 'Indoor',
    tags: ['Partial Shade', 'Low Light', 'Air Purifying'],
    variants: [
      { id: 'var_05a', name: '6" Hanging Basket', sku: 'PQ-M-05', price: 2200, inventory: 18 },
    ],
  },
  {
    id: 'prod_06',
    name: 'Bird of Paradise',
    slug: 'strelitzia-nicolai',
    description: 'Bring a tropical vibe indoors with this large, upright plant featuring banana-like leaves. A true showstopper.',
    price: 8500,
    images: [
      'https://images.unsplash.com/photo-1600415918422-a1896b291c36?q=80&w=800',
      'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=800',
    ],
    category: 'Indoor',
    tags: ['Full Sun'],
    variants: [
      { id: 'var_06a', name: '10" Pot', sku: 'BOP-L-06', price: 8500, inventory: 7 },
    ],
  },
  {
    id: 'prod_07',
    name: 'Bunny Ear Cactus',
    slug: 'opuntia-microdasys',
    description: 'A charming cactus that grows in pads resembling bunny ears, covered in fuzzy glochids instead of sharp spines.',
    price: 1800,
    images: [
      'https://images.unsplash.com/photo-1519336056116-bc0f1771dec8?q=80&w=800',
      'https://images.unsplash.com/photo-1593538192693-9595a9332732?q=80&w=800',
    ],
    category: 'Cacti',
    tags: ['Full Sun'],
    variants: [
      { id: 'var_07a', name: '4" Pot', sku: 'BEC-S-07', price: 1800, inventory: 25 },
    ],
  },
  {
    id: 'prod_08',
    name: 'Calathea Orbifolia',
    slug: 'calathea-orbifolia',
    description: 'Known for its large, round leaves with beautiful silver stripes. A statement plant that is also pet-friendly.',
    price: 4000,
    images: [
      'https://images.unsplash.com/photo-1629231802877-39a73145d4e1?q=80&w=800',
      'https://images.unsplash.com/photo-1629231802877-39a73145d4e1?q=80&w=800',
    ],
    category: 'Indoor',
    tags: ['Partial Shade', 'Pet-Friendly'],
    variants: [
      { id: 'var_08a', name: '6" Pot', sku: 'CO-M-08', price: 4000, inventory: 12 },
    ],
  },
];