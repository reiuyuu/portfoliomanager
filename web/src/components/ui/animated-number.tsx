import NumberFlow from '@number-flow/react'

interface AnimatedNumberProps {
  value: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedNumber({
  value,
  className = '',
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  return (
    <span className={className}>
      {prefix}
      <NumberFlow value={value} />
      {suffix}
    </span>
  )
}
