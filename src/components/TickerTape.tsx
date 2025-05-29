const MESSAGES = [
  <><span className="mr-2">🚀</span>Supercharged Multi-Tool Web App</>,
  <>
    <span className="mr-2">📝</span>Merge, split, and convert PDFs 100% client-side
    <a href="/merge-pdf" className="ml-2 underline text-yellow-300 font-semibold hover:text-yellow-200 transition-colors">Try Now</a>
  </>,
  <>
    <span className="mr-2">📄</span>Batch PDF form filling, color tools, CSV utilities, and more!
    <a href="/tools/batch-pdf-form-filler" className="ml-2 bg-accent text-white px-2 py-0.5 rounded hover:bg-accent-hover transition-colors">Batch Fill PDFs</a>
  </>,
  <>
    <span className="mr-2">🔎</span>Explore all PDF tools
    <a href="/pdf-tools" className="ml-2 underline text-accent font-semibold hover:text-accent/80 transition-colors">See All</a>
  </>,
  <>
    <span className="mr-2">📊</span>Excel &amp; CSV tools: merge, split, filter, convert
    <a href="/tools/excel-merger-splitter" className="ml-2 underline text-green-300 font-semibold hover:text-green-200 transition-colors">Try Excel Tools</a>
  </>,
];

const TickerTape = () => (
  <div className="overflow-hidden w-full bg-primary text-white">
    <div className="whitespace-nowrap animate-ticker text-sm py-1">
      {MESSAGES.map((msg, i) => (
        <span key={i} className="mx-8 align-middle">{msg}</span>
      ))}
    </div>
  </div>
);

export default TickerTape; 