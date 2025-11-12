'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';

export default function CustomerOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to HOTMESS',
      content: 'Get ready to explore bold fashion, underground music, and exciting rewards.',
    },
    {
      title: 'Scan Your First QR Code',
      content: 'Find and scan a HOTMESS QR Beacon to start earning reward points!',
    },
    {
      title: 'Create Your Profile',
      content: 'Sign up or connect an account to track your purchases and rewards.',
    },
    {
      title: 'Let’s Start!',
      content: 'Dive into HOTMESS culture—shop, scan, and tune into HOTMESS Radio.',
    },
  ];

  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const nextStep = () => {
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, steps.length - 1);
      if (next === steps.length - 1 && prev === steps.length - 2) {
        // Reaching last step: after short delay navigate home.
        setTimeout(() => router.push('/'), 1200);
      }
      return next;
    });
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const finish = () => {
    // Optional: show a quick completion state then navigate home
    setCurrentStep(steps.length - 1);
    setTimeout(() => {
      window.location.href = '/';
    }, 600);
  };

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentStep]);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); nextStep(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); }
  };

  return (
    <div onKeyDown={onKeyDown} tabIndex={0} aria-label="Customer onboarding">
      <ProgressBar progress={((currentStep + 1) / steps.length) * 100} />
      <section aria-live="polite">
        <h2 ref={headingRef} tabIndex={-1}>{steps[currentStep].title}</h2>
        <p>{steps[currentStep].content}</p>
      </section>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <Button text="Previous" onClick={prevStep} disabled={currentStep === 0} />
        <Button text={currentStep === steps.length - 1 ? 'Finish' : 'Next'} onClick={currentStep === steps.length - 1 ? finish : nextStep} />
      </div>
    </div>
  );
}
