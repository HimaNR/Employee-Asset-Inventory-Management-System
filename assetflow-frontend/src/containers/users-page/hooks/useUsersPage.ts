import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SelectOption } from '@/components/Select';
import type { TableSort } from '@/components/Table';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { roleDisplay } from '@/libs/role-display';
import { useDebouncedValue } from '@/libs/use-debounced-value';
import { rolesService } from '@/services/roles/roles.service';
import { usersService } from '@/services/users/users.service';
import type { PaginationMeta } from '@/types/api.types';
import type { User, UserQuery, UserStatus } from '@/types/user.types';
import type { UserFormValues } from '../utils/user-form';

const EMPTY_META: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

export function useUsersPage() {
  // ---------- filters ----------
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [roleId, setRoleId] = useState('');
  const [sort, setSort] = useState<TableSort>({ sortBy: 'email', sortOrder: 'asc' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebouncedValue(search);

  const queryKey = JSON.stringify({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    status: status || undefined,
    roleId: roleId || undefined,
    sortBy: sort.sortBy as UserQuery['sortBy'],
    sortOrder: sort.sortOrder,
  } satisfies UserQuery);
  const query = useMemo(() => JSON.parse(queryKey) as UserQuery, [queryKey]);

  // ---------- list ----------
  const requestKey = `${queryKey}#${reloadKey}`;
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [listError, setListError] = useState<ApiError | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    usersService
      .list(query, controller.signal)
      .then((response) => {
        setUsers(response.data);
        setMeta(response.meta);
        setListError(null);
        setLoadedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setListError(ApiError.from(err));
        setLoadedKey(requestKey);
      });
    return () => controller.abort();
  }, [query, requestKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // ---------- roles (filter + form) ----------
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    rolesService
      .list(controller.signal)
      .then((roles) =>
        setRoleOptions(roles.map((r) => ({ value: r.id, label: roleDisplay(r.name).label }))),
      )
      .catch(() => {
        // Not critical
      });
    return () => controller.abort();
  }, []);

  // ---------- messages ----------
  const [notice, setNotice] = useState<string | null>(null);

  // ---------- create / edit ----------
  const [form, setForm] = useState<{ open: boolean; user: User | null; key: number }>({
    open: false,
    user: null,
    key: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<ApiError | null>(null);

  const openCreate = () => {
    setSaveError(null);
    setForm((f) => ({ open: true, user: null, key: f.key + 1 }));
  };
  const openEdit = (user: User) => {
    setSaveError(null);
    setForm((f) => ({ open: true, user, key: f.key + 1 }));
  };
  const closeForm = () => setForm((f) => ({ ...f, open: false }));

  const saveUser = async (values: UserFormValues) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = form.user
        ? await usersService.update(form.user.id, {
            roleId: values.roleId !== form.user.role.id ? values.roleId : undefined,
            status: values.status !== form.user.status ? values.status : undefined,
            employeeId: values.employee?.value ?? null,
          })
        : await usersService.create({
            email: values.email.trim().toLowerCase(),
            password: values.password,
            roleId: values.roleId,
            employeeId: values.employee?.value ?? null,
          });
      closeForm();
      setNotice(form.user ? `${saved.email} was updated.` : `${saved.email} was created.`);
      reload();
    } catch (err) {
      setSaveError(ApiError.from(err));
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- set password ----------
  const [passwordDialog, setPasswordDialog] = useState<{
    open: boolean;
    user: User | null;
    key: number;
  }>({ open: false, user: null, key: 0 });
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<ApiError | null>(null);

  const openPassword = (user: User) => {
    setPasswordError(null);
    setPasswordDialog((d) => ({ open: true, user, key: d.key + 1 }));
  };
  const closePassword = () => setPasswordDialog((d) => ({ ...d, open: false }));

  const savePassword = async (password: string) => {
    if (!passwordDialog.user) return;
    setIsSettingPassword(true);
    setPasswordError(null);
    try {
      await usersService.setPassword(passwordDialog.user.id, password);
      closePassword();
      setNotice(`New password set for ${passwordDialog.user.email}.`);
    } catch (err) {
      setPasswordError(ApiError.from(err));
    } finally {
      setIsSettingPassword(false);
    }
  };

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return {
    users,
    meta,
    isLoading: loadedKey !== requestKey,
    listError,
    reload,
    search,
    status,
    roleId,
    roleOptions,
    changeSearch: resetPage(setSearch),
    changeStatus: resetPage(setStatus),
    changeRole: resetPage(setRoleId),
    sort,
    changeSort: resetPage(setSort),
    changePage: setPage,
    changeLimit: resetPage(setLimit),
    notice,
    dismissNotice: () => setNotice(null),
    form,
    isSaving,
    saveError,
    openCreate,
    openEdit,
    closeForm,
    saveUser,
    passwordDialog,
    isSettingPassword,
    passwordError,
    openPassword,
    closePassword,
    savePassword,
  };
}
