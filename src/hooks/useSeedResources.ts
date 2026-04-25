import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resourcesRepository } from '../database/resourcesRepository';

const defaultResourceTypes = [
  { name: 'Fertilizer',  unit: 'kg',     icon: 'leaf',          color: '#4CAF50', low_stock_threshold: 50  },
  { name: 'Gasoline',    unit: 'liters', icon: 'gas-station',   color: '#FF9800', low_stock_threshold: 20  },
  { name: 'Salt',        unit: 'kg',     icon: 'shaker-outline', color: '#90CAF9', low_stock_threshold: 30 },
  { name: 'Pesticide',   unit: 'liters', icon: 'spray',         color: '#F44336', low_stock_threshold: 10  },
  { name: 'Seeds',       unit: 'kg',     icon: 'seed-outline',  color: '#8BC34A', low_stock_threshold: 100 },
  { name: 'Water',       unit: 'liters', icon: 'water-outline', color: '#2196F3', low_stock_threshold: 500 },
  { name: 'Herbicide',   unit: 'liters', icon: 'bottle-tonic',  color: '#9C27B0', low_stock_threshold: 10  },
];

export const useSeedResources = (session: any) => {
  useEffect(() => {
    if (!session) return;

    const seed = async () => {
      try {
        const seeded = await AsyncStorage.getItem('resources_seeded');
        if (seeded !== 'true') {
          // Double check if types already exist in DB for this user
          const existing = await resourcesRepository.getResourceTypes();
          if (existing.length === 0) {
            console.log('Seeding default resource types...');
            await Promise.all(defaultResourceTypes.map(t =>
              resourcesRepository.createResourceType(t)
            ));
          }
          await AsyncStorage.setItem('resources_seeded', 'true');
        }
      } catch (err) {
        console.error('Error seeding resources:', err);
      }
    };

    seed();
  }, [session]);
};
