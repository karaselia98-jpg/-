const Format = (() => {
// Port of Packages/SalBloxKit/Sources/SalBloxKit/Format.swift
const UNITS = [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];

function trim(d) {
  return d === Math.round(d) ? String(Math.trunc(d)) : d.toFixed(1);
}

// Swift's .rounded() rounds half away from zero
function roundHalfAway(x) {
  return x < 0 ? -Math.round(-x) : Math.round(x);
}

function short(n) {
  if (Math.abs(n) < 1000) return String(n);
  const v = Math.abs(n);
  for (let i = 0; i < UNITS.length; i++) {
    const [size, suffix] = UNITS[i];
    if (v >= size) {
      const rounded = roundHalfAway((v / size) * 10) / 10;
      if (rounded >= 1000 && i > 0) return (n < 0 ? "-" : "") + trim(rounded / 1000) + UNITS[i - 1][1];
      return (n < 0 ? "-" : "") + trim(rounded) + suffix;
    }
  }
  return String(n);
}

function counted(n, one) {
  return `${short(n)} ${n === 1 ? one : one + "s"}`;
}

function grouped(n) {
  const digits = String(Math.abs(n));
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
    out += digits[i];
  }
  return (n < 0 ? "-" : "") + out;
}

function priceText(price) {
  if (price === null || price === undefined) return "Off Sale";
  return price === 0 ? "Free" : grouped(price);
}

// keeps only ASCII digits, at most 15 of them
function digits(text) {
  return [...text].filter(c => c >= "0" && c <= "9").join("").slice(0, 15);
}

function number(text) {
  const d = digits(text);
  return d === "" ? 0 : parseInt(d, 10);
}

// ASCII letters, digits and _, at most 20 characters
function cleanUsername(text) {
  return [...text].filter(c => /^[A-Za-z0-9_]$/.test(c)).join("").slice(0, 20);
}

// Port of chatTime in Format.swift. now/zone are injectable for tests.
function chatTime(at, now = Date.now() / 1000, zone = undefined) {
  const s = Math.max(0, now - at);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.trunc(s / 60)}m`;
  if (s < 86400) return `${Math.trunc(s / 3600)}h`;
  if (s < 7 * 86400) return `${Math.trunc(s / 86400)}d`;
  if (s < 28 * 86400) return `${Math.trunc(s / (7 * 86400))}w`;
  const d = new Date(at * 1000);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: zone });
}

return { short, counted, grouped, priceText, digits, number, cleanUsername, chatTime };
})();
