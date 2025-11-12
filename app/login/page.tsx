import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — HOTMESS London',
  description: 'Sign in with magic link or OAuth.',
};

import LoginClient from './LoginClient';

export default function LoginPage() {
  return <LoginClient />;
}
