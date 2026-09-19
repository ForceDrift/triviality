import Link from "next/link";

type TrivialityLogoProps = {
  href?: string;
};

export function TrivialityLogo({ href = "/" }: TrivialityLogoProps) {
  return (
    <Link
      href={href}
      aria-label="Triviality home"
      className="group flex items-end leading-none"
    >
      <span
        aria-hidden="true"
        className="relative mb-0.5 inline-block h-9 w-8 shrink-0 translate-x-1 rotate-180"
      >
        <span className="absolute bottom-0 left-[9px] h-8 w-[2px] bg-black transition-transform duration-300 group-hover:-translate-y-1" />
        <span className="absolute bottom-0 left-[19px] h-8 w-[2px] bg-black transition-transform duration-300 group-hover:-translate-y-1" />
        <span className="absolute bottom-0 left-0 h-[2px] w-8 bg-black" />
      </span>
      <span className="ml-1 text-xl font-medium tracking-[-0.06em]">
        riviality
      </span>
    </Link>
  );
}
