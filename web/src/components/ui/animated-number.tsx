import NumberFlow from '@number-flow/react'

interface AnimatedNumberProps {
  value: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
}

export function AnimatedNumber({
  value,
  className = '',
  prefix = '',
  suffix = '',
  decimals,
}: AnimatedNumberProps) {
  const formatValue = (val: number) => {
    if (decimals !== undefined) {
      return val.toFixed(decimals)
    }
    return val
  }

  return (
    <span className={className}>
      {prefix}
      <NumberFlow value={Number(formatValue(value))} />
      {suffix}
    </span>
  )
}
