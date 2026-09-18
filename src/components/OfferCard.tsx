import type { NormalizedOffer } from "@/lib/types";

type OfferCardProps = {
  offer: NormalizedOffer;
  isRecommended: boolean;
  tradeoff?: string;
  checkedBagRequired: boolean;
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

function formatDuration(value?: string) {
  if (!value) return "Duration unavailable";
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return value.replace(/^PT/i, "").toLowerCase();
  return [match[1] ? `${match[1]}h` : "", match[2] ? `${match[2]}m` : ""].filter(Boolean).join(" ");
}

function bagLabel(offer: NormalizedOffer) {
  const bags = offer.fareDetails.map((detail) => detail.checkedBag).filter((bag) => bag.status !== "unknown");
  if (!bags.length) return { label: "Bag allowance not shown", tone: "muted" };
  const included = bags.find((bag) => bag.status === "included");
  if (included) {
    if (included.quantity !== undefined) {
      return { label: `${included.quantity} checked bag${included.quantity === 1 ? "" : "s"} included`, tone: "good" };
    }
    if (included.weight !== undefined) {
      const unit = included.weightUnit ? ` ${included.weightUnit}` : "";
      return { label: `${included.weight}${unit} checked-baggage allowance`, tone: "good" };
    }
    return { label: "Checked bag included", tone: "good" };
  }
  return { label: "Checked bag not included", tone: "warn" };
}

export function OfferCard({ offer, isRecommended, tradeoff, checkedBagRequired }: OfferCardProps) {
  const bag = bagLabel(offer);
  return (
    <article className={`offer-card${isRecommended ? " offer-card--recommended" : ""}`}>
      <div className="offer-card__topline">
        {isRecommended ? <span className="recommendation-pill">Recommended</span> : <span className="offer-label">Option</span>}
        <span className="offer-id">#{offer.id.slice(-6)}</span>
      </div>

      <div className="offer-card__price">
        <span className="price-value">{new Intl.NumberFormat("en", { style: "currency", currency: offer.price.currency }).format(offer.price.total)}</span>
        <span className="price-caption">total fare</span>
      </div>

      <div className="offer-card__route-list">
        {offer.itineraries.map((itinerary, index) => {
          const first = itinerary.segments[0];
          const last = itinerary.segments[itinerary.segments.length - 1];
          return (
            <div className="route-row" key={`${offer.id}-${index}`}>
              <div className="route-row__header">
                <span>{index === 0 ? "Outbound" : "Return"}</span>
                <span>{formatDate(first.departure.at)}</span>
              </div>
              <div className="route-row__main">
                <div className="route-time"><strong>{formatTime(first.departure.at)}</strong><span>{first.departure.airport}</span></div>
                <div className="route-line" aria-label={`${itinerary.stops} stops`}>
                  <span>{formatDuration(itinerary.duration)}</span>
                  <i />
                  <small>{itinerary.stops === 0 ? "Direct" : `${itinerary.stops} stop${itinerary.stops === 1 ? "" : "s"}`}</small>
                </div>
                <div className="route-time route-time--right"><strong>{formatTime(last.arrival.at)}</strong><span>{last.arrival.airport}</span></div>
              </div>
              <div className="route-row__carrier">{offer.validatingCarriers.join(" · ") || first.carrierCode} <span aria-hidden="true">•</span> {first.flightNumber}</div>
            </div>
          );
        })}
      </div>

      <div className="offer-facts">
        <span className={bag.tone === "good" ? "fact fact--good" : bag.tone === "warn" ? "fact fact--warn" : "fact fact--muted"}>
          <span aria-hidden="true">▣</span> {bag.label}
        </span>
        {offer.fareDetails[0]?.cabin ? <span className="fact"><span aria-hidden="true">◇</span> {offer.fareDetails[0].cabin.toLowerCase()} cabin</span> : null}
        {checkedBagRequired && bag.tone !== "good" ? <span className="fact fact--warn"><span aria-hidden="true">!</span> Check bag cost</span> : null}
      </div>

      {tradeoff ? <p className="offer-tradeoff">{tradeoff}</p> : null}
    </article>
  );
}
