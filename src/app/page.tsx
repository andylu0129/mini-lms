import { ROUTE_SIGN_IN } from '@/constants/routes';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect(ROUTE_SIGN_IN);
}
