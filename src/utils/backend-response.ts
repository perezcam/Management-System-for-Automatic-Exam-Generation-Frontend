import { showErrorToast } from "@/utils/toast";
import type { BaseResponse } from "@/types/backend-responses";

type DecodeOptions = {
  showToast?: boolean;
};

const DEFAULT_ERROR_MESSAGE = "Error inesperado";

const isBaseResponse = (payload: unknown): payload is BaseResponse =>
  typeof payload === "object" &&
  payload !== null &&
  "success" in payload &&
  "message" in payload &&
  typeof (payload as { success: unknown }).success === "boolean" &&
  typeof (payload as { message: unknown }).message === "string";

export function decodeBackendSchema<TSchema extends BaseResponse>(
  payload: unknown,
  options: DecodeOptions = {},
): TSchema {
  if (!isBaseResponse(payload)) {
    throw new Error(DEFAULT_ERROR_MESSAGE);
  }

  if (!payload.success) {
    if (options.showToast ?? true) {
      showErrorToast(payload.message);
    }
    throw new Error(payload.message);
  }

  return payload as TSchema;
}

export function decodeBackendData<TData>(
  payload: unknown,
  options: DecodeOptions = {},
): TData {
  const schema = decodeBackendSchema<BaseResponse & { data: TData }>(payload, options);
  if (!("data" in schema)) {
    throw new Error(DEFAULT_ERROR_MESSAGE);
  }
  return schema.data;
}

export const extractBackendMessage = (payload: unknown) =>
  isBaseResponse(payload) ? payload.message : null;
