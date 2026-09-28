type LogoProps = {
  footer?: boolean;
};

export default function Logo({ footer = false }: LogoProps) {
  return (
    <span className={`ussx-logo ${footer ? "ussx-logo--footer" : ""}`}>
      <span className="ussx-logo__round">
        <img
          src="/ussx-kreativ-round-logo.png"
          alt="USS X KREATIV"
        />
      </span>
    </span>
  );
}
