import api from './api';
import { ApiResponse, Collection, Testimonial } from './types';
import diamondCollection from '@/assets/collections/diamond-elegance.jpg';
import goldCollection from '@/assets/collections/gold-heritage.jpg';
import bridalCollection from '@/assets/collections/bridal-collection.jpg';

const MOCK_COLLECTIONS: Collection[] = [
  { id: 1, name: 'Diamond Elegance', description: 'Timeless diamond jewellery for special moments', image: diamondCollection, itemCount: 156, startingPrice: '₹25,000' },
  { id: 2, name: 'Gold Heritage', description: 'Traditional gold craftsmanship meets modern design', image: goldCollection, itemCount: 234, startingPrice: '₹15,000' },
  { id: 3, name: 'Bridal Collection', description: 'Exquisite wedding jewellery sets', image: bridalCollection, itemCount: 89, startingPrice: '₹45,000' },
];

const MOCK_TESTIMONIALS: Testimonial[] = [
  { name: 'Priya Sharma', rating: 5, text: 'Absolutely stunning quality! The diamond ring I purchased exceeded my expectations.', purchase: 'Diamond Ring Set' },
  { name: 'Rajesh Kumar', rating: 5, text: 'Excellent service and beautiful jewellery. The bidding experience was thrilling!', purchase: 'Gold Necklace' },
  { name: 'Meera Singh', rating: 5, text: 'Perfect for my wedding! The bridal set was exactly what I dreamed of.', purchase: 'Bridal Collection' },
];

export const homeService = {
  // Mock: GET /home/collections
  async getCollections(): Promise<ApiResponse<Collection[]>> {
    return { success: true, data: MOCK_COLLECTIONS };
  },

  // Mock: GET /home/testimonials
  async getTestimonials(): Promise<ApiResponse<Testimonial[]>> {
    return { success: true, data: MOCK_TESTIMONIALS };
  },
};
