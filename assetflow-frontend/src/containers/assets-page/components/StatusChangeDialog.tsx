'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Badge from '@/components/Badge';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Textarea from '@/components/Textarea';
import type { ApiError } from '@/libs/api/api-error';
import { ASSET_STATUS_DISPLAY, statusActionLabel } from '@/libs/asset-display';
import type { Asset, AssetStatus } from '@/types/asset.types';

interface StatusChangeDialogProps {
  open: boolean;
  asset: Asset | null;
  target: AssetStatus | null;
  isSubmitting: boolean;
  error: ApiError | null;
  onConfirm: (notes: string) => void;
  onClose: () => void;
}

/** Confirms a status change with an optional reason (new `key` per open = fresh notes) */
export function StatusChangeDialog({
  open,
  asset,
  target,
  isSubmitting,
  error,
  onConfirm,
  onClose,
}: StatusChangeDialogProps) {
  const [notes, setNotes] = useState('');
  if (!asset || !target) return null;

  const from = ASSET_STATUS_DISPLAY[asset.status];
  const to = ASSET_STATUS_DISPLAY[target];
  const isDestructive = target === 'RETIRED' || target === 'LOST';

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      size="sm"
      title={`${statusActionLabel(asset.status, target)}: ${asset.assetCode}`}
      description={
        asset.status === 'ASSIGNED' && target === 'LOST'
          ? 'The current assignment will be closed, so nobody holds a lost asset.'
          : 'The change is recorded in the asset history.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={() => onConfirm(notes)}
            isLoading={isSubmitting}
          >
            {statusActionLabel(asset.status, target)}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="flex items-center gap-2">
          <Badge tone={from.tone}>{from.label}</Badge>
          <ArrowRight className="h-3.5 w-3.5 text-ink-muted" aria-label="becomes" />
          <Badge tone={to.tone}>{to.label}</Badge>
        </p>
        <Textarea
          label="Reason"
          value={notes}
          maxLength={500}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional, e.g. Sent to Dell service centre"
        />
        {error && (
          <Banner tone="error">
            <span className="font-medium">{error.title}.</span> {error.detail}
          </Banner>
        )}
      </div>
    </Modal>
  );
}
