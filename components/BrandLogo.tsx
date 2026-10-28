import Image from 'next/image'

type BrandLogoProps = {
  width: number
  height: number
  className?: string
  priority?: boolean
}

export default function BrandLogo({
  width,
  height,
  className,
  priority = false
}: BrandLogoProps) {
  return (
    <Image
      src="/framerio-logo.png"
      alt="Framerio"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
