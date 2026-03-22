import logoSrc from "./logo.svg";

export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return <img src={logoSrc} alt="Alma Deco" className={className} />;
}
