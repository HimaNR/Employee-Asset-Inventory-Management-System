'use client';

import { useState, type FormEvent } from 'react';
import Banner from '@/components/Banner';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import type { ApiError } from '@/libs/api/api-error';
import { friendlyMessage } from '@/libs/api/friendly-error';
import type { User } from '@/types/user.types';
import { validatePassword } from '../utils/user-form';

interface PasswordModalProps {
  open: boolean;
  user: User | null;
  isSubmitting: boolean;
  serverError: ApiError | null;
  onSubmit: (password: string) => void;
  onClose: () => void;
}

export function PasswordModal({
  open,
  user,
  isSubmitting,
  serverError,
  onSubmit,
  onClose,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem =
      validatePassword(password) ?? (password !== confirm ? 'The passwords do not match.' : undefined);
    setError(problem);
    if (!problem) onSubmit(password);
  };

  const formId = 'password-form';

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => undefined : onClose}
      size="sm"
      title="Set a new password"
      description={`For ${user?.email ?? ''}. They will be signed out everywhere.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            Set password
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={error}
          hint="At least 8 characters with a letter and a number"
        />
        <Input
          label="Repeat password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
        {serverError && (
          <Banner tone="error">
            {friendlyMessage(serverError)}
          </Banner>
        )}
      </form>
    </Modal>
  );
}
