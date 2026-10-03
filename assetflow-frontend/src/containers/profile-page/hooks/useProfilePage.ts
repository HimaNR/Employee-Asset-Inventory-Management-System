import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { friendlyMessage } from '@/libs/api/friendly-error';
import { setSession } from '@/libs/session-storage';
import { authService } from '@/services/auth/auth.service';
import type { MyProfile } from '@/types/auth.types';

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}
type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

const EMPTY_FORM: PasswordForm = { current: '', next: '', confirm: '' };

export function useProfilePage() {
  // ---------- profile ----------
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    authService
      .profile(controller.signal)
      .then(setProfile)
      .catch((err: unknown) => {
        if (!isAbortError(err)) setLoadError(ApiError.from(err));
      });
    return () => controller.abort();
  }, []);

  // ---------- change password ----------
  const [form, setForm] = useState<PasswordForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formKey, setFormKey] = useState(0); // remounts the inputs (hides passwords) after success

  const update = (field: keyof PasswordForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
    setSuccess(null);
  };

  const validate = (): PasswordErrors => {
    const next: PasswordErrors = {};
    if (!form.current) next.current = 'Enter your current password.';
    if (!PASSWORD_RULE.test(form.next)) {
      next.next = 'At least 8 characters with a letter and a number.';
    } else if (form.next === form.current) {
      next.next = 'Choose a password different from the current one.';
    }
    if (form.confirm !== form.next) next.confirm = 'The passwords do not match.';
    return next;
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    setFormError(null);
    try {
      const tokens = await authService.changePassword(form.current, form.next);
      setSession(tokens); // stay signed in here; other devices are signed out
      setForm(EMPTY_FORM);
      setFormKey((key) => key + 1);
      setSuccess('Your password was changed. Other devices have been signed out.');
    } catch (err) {
      const apiError = ApiError.from(err);
      const slug = apiError.type.split('/').pop();
      if (slug === 'wrong-current-password') setErrors({ current: apiError.detail });
      else if (slug === 'same-password') setErrors({ next: apiError.detail });
      else setFormError(friendlyMessage(apiError));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    loadError,
    form,
    formKey,
    errors,
    formError,
    success,
    isSaving,
    update,
    changePassword,
  };
}
