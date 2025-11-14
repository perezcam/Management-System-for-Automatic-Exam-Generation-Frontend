export type BaseResponse = {
  success: boolean;
  message: string;
};

export type RetrieveOneSchema<T> = BaseResponse & {
  data: T | null;
};

export type RetrieveManySchema<T> = BaseResponse & {
  data: T[];
};

export type PaginationWithAdditionalDataSchema<
  T,
  A = Record<string, unknown>,
> = BaseResponse & {
  data: T[];
  page_size: number;
  total: number;
  additional_data: A;
};

export type PaginationMeta = {
  limit: number;
  offset: number;
  total: number;
};

export type PaginatedSchema<T> = BaseResponse & {
  data: T[];
  meta: PaginationMeta;
};

export type BackendSchemas<T, A = Record<string, unknown>> =
  | RetrieveOneSchema<T>
  | RetrieveManySchema<T>
  | PaginationWithAdditionalDataSchema<T, A>
  | PaginatedSchema<T>
  | (BaseResponse & { data: T });
