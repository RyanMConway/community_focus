import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Get a Management Proposal',
  description:
    "Request a customized HOA management proposal from Community Focus of NC. Tell us about your community and we'll be in touch within one business day.",
};

export default function GetProposalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
