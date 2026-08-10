import Image from "next/image";

interface BrandLogoProps {
  priority?: boolean;
  className?: string;
}

export function BrandLogo({ priority = false, className = "" }: BrandLogoProps) {
  return (
    <span
      className={`brand-logo ${className}`}
      aria-label="Ken Code — Desarrollamos soluciones, construimos el futuro"
    >
      <Image
        src="/brand/ken-code-logo.jpg"
        alt="Ken Code — Desarrollamos soluciones, construimos el futuro"
        width={1241}
        height={620}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 640px) 132px, 164px"
      />
    </span>
  );
}
