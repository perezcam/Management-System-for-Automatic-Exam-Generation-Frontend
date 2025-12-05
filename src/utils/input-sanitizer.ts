import type { FocusEvent } from "react"

type InputValue = string | number | undefined

const isStringValue = (value: InputValue): value is string => typeof value === "string"

const stripLeadingZeros = (value: string) => value.replace(/^0+(?=\d)/, "")

export const sanitizeIntegerInput = (value: InputValue, fallback = 0) => {
  if (!isStringValue(value) || value === "") {
    return fallback
  }

  const normalized = stripLeadingZeros(value)
  const parsed = parseInt(normalized, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const sanitizeDecimalInput = (value: InputValue, fallback = 0) => {
  if (!isStringValue(value) || value === "") {
    return fallback
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const selectAllWhenZeroOrEmpty = (event: FocusEvent<HTMLInputElement>) => {
  const { value } = event.target

  if (value === "" || Number(value) === 0) {
    event.target.select()
  }
}
