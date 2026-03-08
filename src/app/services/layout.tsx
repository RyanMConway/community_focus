import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'HOA Management Services',
  description:
    "Explore Community Focus of NC's full range of association management services: financial reporting, vendor coordination, administrative support, and digital communication tools.",
};

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
