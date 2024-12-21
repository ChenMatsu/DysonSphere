import type { MetaFunction } from '@remix-run/node';
import SolarSystem from '~/components/solar-system';

export const meta: MetaFunction = () => {
  return [{ title: 'Solar System' }, { name: 'Solar System', content: 'Solar System with Dyson Sphere' }];
};

export default function Index() {
  return <SolarSystem />;
}
