'use client';

import React, { useMemo, useState, useRef } from 'react';
import { z } from 'zod';
import InputField from '@/components/InputField';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';

interface SellerFormData {
  name: string;
  shopName: string;
  email: string;
  productCategory: string;
  productDescription: string;
  brandingAgreement: boolean;
}

export default function SellerOnboardingPage() {
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, 'Please enter your full name'),
        shopName: z.string().min(2, 'Please enter your shop name'),
        email: z.string().email('Enter a valid email'),
        productCategory: z.string().min(1, 'Select a category'),
        productDescription: z.string().min(10, 'Describe your products (min 10 chars)'),
        brandingAgreement: z
          .boolean()
          .refine((val) => val === true, {
            message: 'You must agree to the branding guidelines.',
          }),
      }),
    []
  );

  const [formData, setFormData] = useState<SellerFormData>({
    name: '',
    shopName: '',
    email: '',
    productCategory: '',
    productDescription: '',
    brandingAgreement: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement | null>(null);
  const firstErrorRef = useRef<HTMLParagraphElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleFieldChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Gate branding agreement with alert per requirement
    if (!formData.brandingAgreement) {
      alert('You must agree to the branding guidelines.');
      return;
    }
    const parsed = schema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      // Focus first error
      setTimeout(() => {
        if (firstErrorRef.current) firstErrorRef.current.focus();
      }, 0);
      return;
    }
    setErrors({});
    setApiError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to submit application');
      setSubmitted(true);
      setFormData({
        name: '',
        shopName: '',
        email: '',
        productCategory: '',
        productDescription: '',
        brandingAgreement: false,
      });
      // Move focus to success banner
      setTimeout(() => successRef.current?.focus(), 0);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Sell with HOTMESS</h2>
      <p className="text-sm mb-6 opacity-80">Create, ship, and earn with bold branding.</p>
      <ProgressBar progress={70} />
      {apiError && (
        <div style={{ marginBottom: 16, border: '1px solid #7a1a1a', background: '#2a0f10', color: '#ffb4b4', padding: 12, borderRadius: 6, fontSize: 14 }}>
          {apiError}
        </div>
      )}
      {submitted && (
        <div
          ref={successRef}
          tabIndex={-1}
          aria-live="polite"
          className="mb-4 rounded border border-green-600 bg-green-900/40 p-3 text-sm text-green-300"
        >
          Application submitted successfully!
        </div>
      )}
      <form ref={formRef} aria-describedby={apiError ? 'seller-form-error' : undefined} onSubmit={handleSubmit} className="space-y-5" noValidate>
        <InputField
          label="Full Name"
          name="name"
          required
          placeholder="Enter your full name..."
          value={formData.name}
          onChange={handleFieldChange}
        />
  {errors.name && <p ref={!firstErrorRef.current ? firstErrorRef : undefined} tabIndex={-1} style={{ color: '#ff6b6b', fontSize: 12 }} aria-live="assertive">{errors.name}</p>}
        <InputField
          label="Shop Name"
          name="shopName"
          required
          placeholder="Enter your shop name..."
          value={formData.shopName}
          onChange={handleFieldChange}
        />
  {errors.shopName && <p ref={!firstErrorRef.current ? firstErrorRef : undefined} tabIndex={-1} style={{ color: '#ff6b6b', fontSize: 12 }} aria-live="assertive">{errors.shopName}</p>}
        <InputField
          label="Email"
          name="email"
          type="email"
          required
          placeholder="Enter your email address..."
          value={formData.email}
          onChange={handleFieldChange}
        />
  {errors.email && <p ref={!firstErrorRef.current ? firstErrorRef : undefined} tabIndex={-1} style={{ color: '#ff6b6b', fontSize: 12 }} aria-live="assertive">{errors.email}</p>}
        <div>
          <label>Product Category</label>
          <select
            name="productCategory"
            value={formData.productCategory}
            onChange={handleSelectChange}
            style={{ width: '100%', padding: '10px', margin: '8px 0' }}
            required
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="apparel">Apparel</option>
            <option value="accessories">Accessories</option>
            <option value="self-care">Self-Care</option>
            <option value="custom">Custom</option>
          </select>
        </div>
  {errors.productCategory && <p ref={!firstErrorRef.current ? firstErrorRef : undefined} tabIndex={-1} style={{ color: '#ff6b6b', fontSize: 12 }} aria-live="assertive">{errors.productCategory}</p>}
        <InputField
          type="textarea"
          label="Product Description"
          name="productDescription"
          required
          placeholder="Tell us about your products..."
          value={formData.productDescription}
          onChange={handleFieldChange}
        />
        {errors.productDescription && (
          <p ref={!firstErrorRef.current ? firstErrorRef : undefined} tabIndex={-1} style={{ color: '#ff6b6b', fontSize: 12 }} aria-live="assertive">{errors.productDescription}</p>
        )}
        <div>
          <label>
            <input
              type="checkbox"
              name="brandingAgreement"
              checked={formData.brandingAgreement}
              onChange={handleCheckboxChange}
              style={{ marginRight: '8px' }}
            />
            I agree to HOTMESS branding and shipping guidelines.
          </label>
        </div>
        {errors.brandingAgreement && (
          <p ref={!firstErrorRef.current ? firstErrorRef : undefined} tabIndex={-1} style={{ color: '#ff6b6b', fontSize: 12 }} aria-live="assertive">{errors.brandingAgreement}</p>
        )}
        <Button
          type="submit"
            text={submitting ? 'Submitting...' : 'Submit Application'}
          disabled={submitting}
          className="w-full"
        />
      </form>
    </div>
  );
}
