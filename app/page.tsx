'use client';

import { Landing } from '@/components/Landing/Landing';
import { StakeTree } from '@/components/StakeTree/StakeTree';

export default function HomePage() {
  return (
    <>
      <StakeTree stakePool={'stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi'} />
    </>
  );
}
