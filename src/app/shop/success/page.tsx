import SuccessClient from "./SuccessClient";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    session_id?: string;
  }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    return (
      <main className="checkout-result-page">
        <div className="checkout-result-card">
          <span>USS X KREATIV</span>
          <h1>Липсва информация за плащането.</h1>
        </div>
      </main>
    );
  }

  return (
    <SuccessClient sessionId={sessionId} />
  );
}
