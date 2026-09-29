// Body produced by the filter's converters
export interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: string[]; // validation messages
  [extension: string]: unknown; // RFC 9457 allows extra fields
}

// Final response = Problem + request info
export interface ProblemDetails extends Problem {
  instance?: string;
  requestId?: string;
}