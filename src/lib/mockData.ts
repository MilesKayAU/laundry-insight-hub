
export type ProductType = 'Laundry Sheet' | 'Laundry Pod';

export interface Product {
  id: string;
  name: string;
  brand: string;
  type: ProductType;
  pvaPercentage: number | null;
  keywords: string[];
  approved: boolean;
  submittedAt: string;
  imageUrl?: string;
  country?: string;
}

export interface AdminSettings {
  keywords: string[];
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'EcoSheet',
    brand: 'GreenClean',
    type: 'Laundry Sheet',
    pvaPercentage: 45,
    keywords: ['PVA', 'polyvinyl alcohol'],
    approved: true,
    submittedAt: '2023-10-15T10:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGF1bmRyeSUyMGRldGVyZ2VudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    country: 'Global'
  },
  {
    id: '2',
    name: 'BioSheet',
    brand: 'NatureWash',
    type: 'Laundry Sheet',
    pvaPercentage: 30,
    keywords: ['PVA', 'polyvinyl alcohol'],
    approved: true,
    submittedAt: '2023-11-05T14:20:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1a7f1c62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGF1bmRyeSUyMHBvZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    country: 'Global'
  },
  {
    id: '3',
    name: 'CleanPod',
    brand: 'PureBubble',
    type: 'Laundry Pod',
    pvaPercentage: 60,
    keywords: ['PVA', 'polyvinyl alcohol', 'PVOH'],
    approved: true,
    submittedAt: '2023-09-22T09:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1635107875259-bbd364c08360?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGF1bmRyeSUyMHBvZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    country: 'Global'
  },
  {
    id: '4',
    name: 'FreshPod Max',
    brand: 'CleanCo',
    type: 'Laundry Pod',
    pvaPercentage: 55,
    keywords: ['PVA', 'polyvinyl alcohol', 'PVOH'],
    approved: true,
    submittedAt: '2023-12-10T16:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2xlYW5pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    country: 'Global'
  },
  {
    id: '5',
    name: 'Eco Sheet Ultra',
    brand: 'GreenGlow',
    type: 'Laundry Sheet',
    pvaPercentage: 40,
    keywords: ['PVA', 'polyvinyl alcohol'],
    approved: false,
    submittedAt: '2024-01-05T11:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGF1bmRyeXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
    country: 'Global'
  }
];

export const mockAdminSettings: AdminSettings = {
  keywords: ['PVA', 'polyvinyl alcohol', 'PVOH', 'polyvinyl', 'poly vinyl']
};
