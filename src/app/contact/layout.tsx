import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Community Focus of NC. Submit a general inquiry or request a management proposal for your community.',
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
