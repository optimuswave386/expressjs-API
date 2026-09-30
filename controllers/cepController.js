
const asyncHandler = require('express-async-handler');
const cep = require('../models/cep.js'); // Import the model

let projectsList = [
    {
    tag: "SYSTEMS",
    index: "01",
    title: "Hyperion DB",
    description:
      "A distributed, lock-free key-value store built in Rust featuring raft consensus, pluggable storage engines, and ultra-low latency snapshotting.",
    stack: ["Rust", "Raft", "gRPC", "WASM"],
    href: "#",
  },
  {
    tag: "COMPILERS",
    index: "02",
    title: "Nova CSS Compiler",
    description:
      "A zero-runtime CSS-in-JS compiler for React. Extracts dynamic style definitions into optimized atomic CSS bundles at compile time.",
    stack: ["TypeScript", "AST Parser", "Vite", "React"],
    href: "#",
  },
  {
    tag: "NETWORKING",
    index: "03",
    title: "Aether-RPC Protocol",
    description:
      "High-throughput binary RPC protocol utilizing WebTransport. Designed specifically for low-latency streaming inside serverless environments.",
    stack: ["Go", "WebTransport", "Protobuf", "HTTP/3"],
    href: "#",
  },
  {
    tag: "SANDBOX",
    index: "04",
    title: "Orbit Terminal Sandbox",
    description:
      "A sandboxed xterm.js terminal environment running completely client-side. Interprets shell instructions using a custom compiled bytecode.",
    stack: ["WebAssembly", "C++", "Xterm.js", "Docker"],
    href: "#",
  },
  {
    tag: "DEVTOOLS",
    index: "05",
    title: "Chronos Profiler",
    description:
      "Real-time Node.js event-loop CPU profiler with non-blocking V8 hooks and automated flamegraph generation for high-density pipelines.",
    stack: ["Node.js", "C++ Addon", "D3.js", "V8 Engine"],
    href: "#",
  },
  {
    tag: "CLI UTILS",
    index: "06",
    title: "Prism Terminal CLI",
    description:
      "An elegant, fast command-line output visualizer. Auto-detects log structures and styles them using high-contrast terminal schemes.",
    stack: ["Go", "Bubbles", "Lipgloss", "ANSI"],
    href: "#",
  },
];

exports.getProjects = asyncHandler( async (req, res) => {
  res.status(200).json(projectsList);
});

exports.getProjectsFromDB = asyncHandler( async (req, res) => {
  const projectsFromDB = await cep.find({});
  //console.log('Found docs:', projectsFromDB);
  res.status(200).json(projectsFromDB);
});

exports.getProjectsFromDB_withpagination = asyncHandler( async (req, res) => {
  const itemsPerPage = parseInt(req.params.itemsperpage);
  if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
    return res.status(400).send('Invalid items per page parameter');
  }
  const projectsFromDB = await cep.find({}).limit(itemsPerPage);
  res.status(200).json(projectsFromDB);
});