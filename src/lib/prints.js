/**
 * Print size options and pricing
 */
export const PRINT_SIZES = [
  {
    id: '5x7',
    label: '5×7"',
    description: 'Standard photo print',
    priceCents: 1200,
    priceDisplay: '$12',
  },
  {
    id: '8x10',
    label: '8×10"',
    description: 'Classic portrait size',
    priceCents: 2000,
    priceDisplay: '$20',
  },
  {
    id: '11x14',
    label: '11×14"',
    description: 'Large wall print',
    priceCents: 3000,
    priceDisplay: '$30',
  },
  {
    id: '16x20_canvas',
    label: '16×20" Canvas',
    description: 'Gallery-wrapped canvas',
    priceCents: 6000,
    priceDisplay: '$60',
  },
]

export function getPrintSize(id) {
  return PRINT_SIZES.find(s => s.id === id)
}
