import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Homeowner Resources',
  description:
    'Pay assessments, submit maintenance requests, explore NC HOA statutes, and access trusted vendor resources — all in one place.',
};

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
