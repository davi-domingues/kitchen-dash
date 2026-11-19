const pad2 = (value) => String(value).padStart(2, '0')

export function toUtcDateKey(date) {
  if (!(date instanceof Date)) {
    throw new Error('expected Date instance for UTC key')
  }

  const year = date.getUTCFullYear()
  const month = pad2(date.getUTCMonth() + 1)
  const day = pad2(date.getUTCDate())

  return `${year}-${month}-${day}`
}

export function utcDateKeyToNumber(dateKey) {
  const [year, month, day] = String(dateKey).split('-')

  if (!year || !month || !day) {
    throw new Error('invalid UTC date key')
  }

  return Number(`${year}${month}${day}`)
}
