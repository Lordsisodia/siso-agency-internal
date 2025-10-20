import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { PartnerReferralsTab } from '@/ecosystem/internal/partners/components/referrals/PartnerReferralsTab';
import type { PartnerReferral } from '@/ecosystem/internal/partners/types/partner.types';

const baseReferral: PartnerReferral = {
  id: 'ref-001',
  partnerId: 'partner-123',
  clientName: 'Acme Contact',
  clientEmail: 'contact@acme.test',
  stage: 'new',
  estimatedValue: 25000,
  actualValue: undefined,
  referredAt: '2025-10-01T00:00:00.000Z',
  referralSource: 'LinkedIn',
  commissionAmount: undefined,
  commissionStatus: undefined,
};

describe('PartnerReferralsTab', () => {
  it('validates referral creation before submitting to Supabase', async () => {
    const onCreateReferral = vi.fn().mockResolvedValue(undefined);

    render(
      <PartnerReferralsTab referrals={[]} onCreateReferral={onCreateReferral} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /add referral/i }));

    const createDialog = await screen.findByRole('dialog');
    const saveButton = within(createDialog).getByRole('button', { name: /save referral/i });
    expect(saveButton).toBeDisabled();

    const nameInput = within(createDialog).getByLabelText(/client name/i);
    const emailInput = within(createDialog).getByLabelText(/client email/i);
    const estimatedValueInput = within(createDialog).getByLabelText(/estimated value/i);

    fireEvent.change(nameInput, { target: { value: 'New Partner Lead' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'partner@example.com' } });
    fireEvent.blur(emailInput);
    await waitFor(() =>
      expect(screen.queryByText(/valid email address/i)).not.toBeInTheDocument(),
    );

    fireEvent.change(estimatedValueInput, { target: { value: '-100' } });
    fireEvent.blur(estimatedValueInput);
    expect(await screen.findByText(/cannot be negative/i)).toBeInTheDocument();

    fireEvent.change(estimatedValueInput, { target: { value: '5000' } });
    fireEvent.blur(estimatedValueInput);
    await waitFor(() =>
      expect(screen.queryByText(/cannot be negative/i)).not.toBeInTheDocument(),
    );

    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(onCreateReferral).toHaveBeenCalledWith({
        clientName: 'New Partner Lead',
        clientEmail: 'partner@example.com',
        companyName: undefined,
        referralSource: undefined,
        notes: undefined,
        stage: 'new',
        estimatedValue: 5000,
        actualValue: undefined,
      }),
    );
  });

  it('enforces commission entry validation before logging', async () => {
    const onRecordCommission = vi.fn().mockResolvedValue(undefined);

    render(
      <PartnerReferralsTab
        referrals={[baseReferral]}
        onRecordCommission={onRecordCommission}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /record commission/i }));

    const commissionDialog = await screen.findByRole('dialog');
    const saveCommissionButton = within(commissionDialog).getByRole('button', { name: /save commission/i });
    expect(saveCommissionButton).toBeDisabled();

    const amountInput = within(commissionDialog).getByLabelText(/commission amount/i);

    fireEvent.change(amountInput, { target: { value: '-200' } });
    fireEvent.blur(amountInput);
    expect(await screen.findByText(/positive amount/i)).toBeInTheDocument();

    fireEvent.change(amountInput, { target: { value: '1200' } });
    fireEvent.blur(amountInput);
    await waitFor(() =>
      expect(screen.queryByText(/positive amount/i)).not.toBeInTheDocument(),
    );

    const statusTrigger = within(commissionDialog).getByRole('combobox');
    fireEvent.click(statusTrigger);
    fireEvent.click(screen.getByRole('option', { name: /approved/i }));

    await waitFor(() => expect(saveCommissionButton).toBeEnabled());
    fireEvent.click(saveCommissionButton);

    await waitFor(() =>
      expect(onRecordCommission).toHaveBeenCalledWith({
        referralId: baseReferral.id,
        commissionAmount: 1200,
        status: 'approved',
        paymentMethod: undefined,
        transactionId: undefined,
        paidAt: null,
      }),
    );
  });
});
