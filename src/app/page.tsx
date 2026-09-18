"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import type { ComparisonResponse, NormalizedOffer } from "@/lib/types";
import { OfferCard } from "@/components/OfferCard";

type FormState = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: string;
  checkedBag: "required" | "not_required";
  flexibility: "lowest_price" | "balanced" | "change_flexibility";
};

const initialForm: FormState = {
  origin: "CDG",
  destination: "IST",
  departureDate: "2026-11-12",
  returnDate: "",
  adults: "1",
  checkedBag: "required",
  flexibility: "balanced",
};

function Icon({ name }: { name: "arrow" | "search" | "spark" | "shield" | "book" | "alert" | "plane" }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    spark: <><path d="m12 3 1.6 6.4L20 11l-6.4 1.6L12 19l-1.6-6.4L4 11l6.4-1.6L12 3Z" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" /></>,
    alert: <><path d="M12 4 21 20H3L12 4Z" /><path d="M12 10v4" /><path d="M12 17h.01" /></>,
    plane: <><path d="m3 11 18-7-7 18-2.4-7.6L3 11Z" /><path d="m11.6 14.4 4.9-4.9" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function displayError(value: unknown) {
  if (typeof value === "string") return value;
  return "We could not compare those flights right now. Please try again.";
}

function localDateIso() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function HomePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<ComparisonResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimumDate, setMinimumDate] = useState("");

  useEffect(() => {
    setMinimumDate(localDateIso());
  }, []);

  const recommendedId = result?.analysis?.recommendedOfferId;
  const tradeoffs = useMemo(() => new Map((result?.analysis?.offerTradeoffs ?? []).map((item) => [item.offerId, item.summary])), [result]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function useExample() {
    setForm(initialForm);
    setError("");
    setResult(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, origin: form.origin.toUpperCase(), destination: form.destination.toUpperCase(), adults: Number(form.adults), returnDate: form.returnDate || undefined }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = typeof payload === "object" && payload !== null && "error" in payload ? payload.error : undefined;
        throw new Error(displayError(message));
      }
      setResult(payload as ComparisonResponse);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The comparison could not be completed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="Flight Offer Expert home"><span className="brand-mark"><Icon name="plane" /></span><span>flight<span className="brand-accent">expert</span></span></Link>
        <div className="nav-note"><span className="status-dot" /> Live offer comparison</div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-icon"><Icon name="spark" /></span> Better decisions, not just cheaper tickets</p>
          <h1>Find the fare that<br /><em>fits your trip.</em></h1>
          <p className="hero-lede">Compare live flight offers with the details that matter — baggage, flexibility, and the fine print.</p>
        </div>

        <div className="search-panel" id="search">
          <div className="panel-heading"><div><span className="panel-kicker">Start a comparison</span><h2>Where are you headed?</h2></div><button className="example-button" type="button" onClick={useExample}>Try an example <Icon name="arrow" /></button></div>
          <form onSubmit={submit}>
            <div className="form-grid form-grid--route">
              <label className="field"><span>From</span><div className="input-wrap"><Icon name="plane" /><input value={form.origin} onChange={(event) => update("origin", event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))} placeholder="CDG" maxLength={3} required aria-label="Origin airport code" /></div><small>Airport code</small></label>
              <div className="swap" aria-hidden="true">↔</div>
              <label className="field"><span>To</span><div className="input-wrap"><Icon name="plane" /><input value={form.destination} onChange={(event) => update("destination", event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))} placeholder="MAD" maxLength={3} required aria-label="Destination airport code" /></div><small>Airport code</small></label>
              <label className="field"><span>Departure</span><input type="date" value={form.departureDate} min={minimumDate || undefined} onChange={(event) => update("departureDate", event.target.value)} required /></label>
              <label className="field"><span>Return <b>(optional)</b></span><input type="date" value={form.returnDate} min={form.departureDate || minimumDate || undefined} onChange={(event) => update("returnDate", event.target.value)} /></label>
            </div>
            <div className="form-divider" />
            <div className="form-grid form-grid--preferences">
              <label className="field"><span>Travellers</span><select value={form.adults} onChange={(event) => update("adults", event.target.value)}><option value="1">1 adult</option><option value="2">2 adults</option><option value="3">3 adults</option><option value="4">4 adults</option><option value="5">5 adults</option></select></label>
              <fieldset className="choice-field"><legend>Checked baggage</legend><div className="segmented"><label className={form.checkedBag === "required" ? "selected" : ""}><input type="radio" name="bag" value="required" checked={form.checkedBag === "required"} onChange={() => update("checkedBag", "required")} /> I need a bag</label><label className={form.checkedBag === "not_required" ? "selected" : ""}><input type="radio" name="bag" value="not_required" checked={form.checkedBag === "not_required"} onChange={() => update("checkedBag", "not_required")} /> No checked bag</label></div></fieldset>
              <label className="field"><span>What matters most?</span><select value={form.flexibility} onChange={(event) => update("flexibility", event.target.value as FormState["flexibility"])}><option value="balanced">A balanced choice</option><option value="lowest_price">Lowest price</option><option value="change_flexibility">Easy changes</option></select></label>
              <button className="submit-button" type="submit" disabled={loading}>{loading ? <><span className="spinner" /> Comparing…</> : <><Icon name="search" /> Compare offers</>}</button>
            </div>
          </form>
        </div>
      </section>

      {!result && !error && !loading ? <section className="trust-strip shell"><div className="trust-item"><span><Icon name="shield" /></span><div><strong>Offer-level facts</strong><small>Direct from Amadeus</small></div></div><div className="trust-item"><span><Icon name="book" /></span><div><strong>Policy context</strong><small>Reviewed Sanity guidance</small></div></div><div className="trust-item"><span><Icon name="spark" /></span><div><strong>Useful tradeoffs</strong><small>Clearer than a price list</small></div></div></section> : null}

      <section className="results shell" aria-live="polite">
        {loading ? <div className="loading-state"><span className="loading-orbit"><Icon name="spark" /></span><h2>Reading the options…</h2><p>Checking prices, routes, and fare details for your trip.</p></div> : null}
        {error ? <div className="message-card message-card--error"><span className="message-icon"><Icon name="alert" /></span><div><h2>We hit a snag</h2><p>{error}</p><button className="secondary-button" type="button" onClick={() => setError("")}>Edit search</button></div></div> : null}
        {result && !loading ? <ComparisonResults result={result} recommendedId={recommendedId} tradeoffs={tradeoffs} checkedBagRequired={form.checkedBag === "required"} searchLabel={`${form.origin} → ${form.destination}`} /> : null}
      </section>

      <footer className="footer shell"><span>Flight Offer Expert</span><span>Prices and conditions change. Always verify before purchase.</span></footer>
    </main>
  );
}

function ComparisonResults({ result, recommendedId, tradeoffs, checkedBagRequired, searchLabel }: { result: ComparisonResponse; recommendedId?: string; tradeoffs: Map<string, string>; checkedBagRequired: boolean; searchLabel: string }) {
  return (
    <div className="comparison-output">
      <div className="results-heading"><div><p className="eyebrow">Your comparison · {searchLabel}</p><h2>{result.offers.length} offer{result.offers.length === 1 ? "" : "s"} worth a closer look</h2></div><span className={result.dataMode === "live" ? "mode-badge mode-badge--live" : "mode-badge"}><span className="status-dot" /> {result.dataMode === "live" ? "Live offer data" : "Demo fixture data"}</span></div>
      {result.degraded ? <div className="notice notice--amber"><Icon name="alert" /><div><strong>Comparison complete, policy context is limited</strong><span>We found offer data, but the recommendation service did not return. Review the confirmed facts below.</span></div></div> : null}
      {!result.degraded && result.analysis ? <section className="recommendation"><div className="recommendation__icon"><Icon name="spark" /></div><div><p className="section-label">Expert read</p><h3>{result.analysis.recommendation}</h3><p className="recommendation__meta">Based on your {checkedBagRequired ? "checked-bag" : "no checked-bag"} preference and a {result.analysis ? "fare and policy" : "fare"} comparison.</p></div></section> : null}
      <div className="source-legend"><span><i className="legend-dot legend-dot--confirmed" /> Confirmed offer data <small>from Amadeus</small></span><span><i className="legend-dot legend-dot--guidance" /> General policy guidance <small>from Sanity</small></span></div>
      <div className="offer-grid">{result.offers.map((offer: NormalizedOffer) => <OfferCard key={offer.id} offer={offer} isRecommended={offer.id === recommendedId} tradeoff={tradeoffs.get(offer.id)} checkedBagRequired={checkedBagRequired} />)}</div>
      {!result.offers.length ? <div className="empty-state"><h3>No usable offers found</h3><p>Try another date or route.</p></div> : null}
      <div className="details-grid">
        <section className="details-card details-card--confirmed"><div className="details-card__heading"><span className="details-icon"><Icon name="shield" /></span><div><p className="section-label">Confirmed facts</p><h3>What the offer says</h3></div></div><p>These details come directly from the returned flight offer and are specific to the options above.</p><ul><li>Price, carrier, schedule, stops, and duration</li><li>Checked-bag allowance where supplied</li><li>Fare details and rules returned for this offer</li></ul></section>
        <section className="details-card details-card--guidance"><div className="details-card__heading"><span className="details-icon"><Icon name="book" /></span><div><p className="section-label">General guidance</p><h3>Policy context from Sanity</h3></div></div>{result.analysis?.policyGuidance?.length ? <ul className="citation-list">{result.analysis.policyGuidance.map((citation) => <li key={citation.url}><a href={citation.url} target="_blank" rel="noreferrer">{citation.title}<span aria-hidden="true">↗</span></a><p>{citation.summary}</p></li>)}</ul> : <p>Policy guidance is unavailable for this comparison. Use the airline’s current fare rules before buying.</p>}</section>
      </div>
      {result.uncertainties.length ? <div className="uncertainty"><span><Icon name="alert" /></span><div><strong>Worth checking before you buy</strong><ul>{result.uncertainties.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div></div> : null}
      <p className="disclaimer"><strong>Important:</strong> {result.disclaimer}</p>
    </div>
  );
}
