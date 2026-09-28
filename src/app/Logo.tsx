type LogoProps = {
  footer?: boolean;
};

export default function Logo({ footer = false }: LogoProps) {
  return (
    <span className={`ussx-logo ${footer ? "ussx-logo--footer" : ""}`}>
      <img
        className="ussx-logo__image"
        src="/ussx-kreativ-logo.webp"
        alt="USS X KREATIV"
      />
    </span>
  );
}
