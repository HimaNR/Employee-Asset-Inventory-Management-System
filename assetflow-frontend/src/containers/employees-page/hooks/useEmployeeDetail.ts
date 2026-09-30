import { useEffect, useState } from 'react';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { employeesService } from '@/services/employees/employees.service';
import type { Employee, EmployeeAssignment } from '@/types/employee.types';

const PAGE_SIZE = 10;

/** Loads one employee + assets held now + past assignments */
export function useEmployeeDetail(employeeId: string | null, refreshKey: number) {
  // "Load more" for past assignments, remembered per employee
  const [limitState, setLimitState] = useState({ employeeId, limit: PAGE_SIZE });
  const pastLimit = limitState.employeeId === employeeId ? limitState.limit : PAGE_SIZE;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [current, setCurrent] = useState<EmployeeAssignment[]>([]);
  const [past, setPast] = useState<EmployeeAssignment[]>([]);
  const [pastTotal, setPastTotal] = useState(0);
  const [error, setError] = useState<ApiError | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = `${employeeId}#${refreshKey}#${pastLimit}`;

  useEffect(() => {
    if (!employeeId) return;
    const controller = new AbortController();

    Promise.all([
      employeesService.get(employeeId, controller.signal),
      employeesService.assignments(employeeId, { status: 'ACTIVE', limit: 100 }, controller.signal),
      employeesService.assignments(
        employeeId,
        { status: 'RETURNED', limit: pastLimit },
        controller.signal,
      ),
    ])
      .then(([loadedEmployee, currentPage, pastPage]) => {
        setEmployee(loadedEmployee);
        setCurrent(currentPage.data);
        setPast(pastPage.data);
        setPastTotal(pastPage.meta.total);
        setError(null);
        setLoadedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(ApiError.from(err));
        setLoadedKey(requestKey);
      });

    return () => controller.abort();
  }, [employeeId, pastLimit, requestKey]);

  const isCurrent = employee !== null && employee.id === employeeId;

  return {
    employee: isCurrent ? employee : null,
    currentAssignments: isCurrent ? current : [],
    pastAssignments: isCurrent ? past : [],
    hasMorePast: isCurrent && pastTotal > past.length,
    isLoading: employeeId !== null && loadedKey !== requestKey,
    error,
    loadMorePast: () => setLimitState({ employeeId, limit: pastLimit + PAGE_SIZE }),
  };
}
