# ⚡ LogicGate Lab — Interactive Logic Gate Simulator & Digital Circuit Designer

<div align="center">
  <img src="public/lgl.png" alt="LogicGate Lab Logo" width="120" />

  <h3>A Modern, High-Performance, Web-Based Digital Logic CAD & Educational Circuit Simulation Engine</h3>

  <p>
    <b>Design, wire, simulate, analyze, and test complex digital logic systems in real time with zero latency.</b>
  </p>

  <p>
    <a href="#-key-features">Features</a> •
    <a href="#-component-catalog">Components</a> •
    <a href="#-the-lgl-file-format">.lgl File Specification</a> •
    <a href="#-built-in-modes--tools">Tools & Modes</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-keyboard-shortcuts">Shortcuts</a>
  </p>
</div>

---

## 📖 Overview

**LogicGate Lab** is an interactive, browser-native digital circuit simulator engineered for electrical engineers, computer science students, educators, and electronics hobbyists. It combines a CAD-grade vector schematic canvas with a real-time signal propagation engine, automated multi-variable truth table generation, digital oscilloscope waveform timing analysis, and an official **`.lgl` (LogicGate Lab)** native file format.

Whether you are building simple combinatorial logic gates or cascading complex multi-bit arithmetic units and flip-flops, **LogicGate Lab** delivers an ultra-smooth, responsive simulation experience on both desktop and mobile devices.

---

## ✨ Key Features

### ⚡ 1. Real-Time Logic Propagation Engine
- **Instant Signal Updates**: Wires glow and pulse in real time reflecting logic state `HIGH` (Logic `1` / Emerald green) and `LOW` (Logic `0` / Dark Slate).
- **Sub-Gate Propagation**: Accurate behavioral modeling of basic logic gates, multi-input gates, tri-state buffers, arithmetic chips, and clock oscillators.
- **Clock Controls**: Configurable square-wave clock generator with variable frequencies ($1\text{ Hz}$ to $20\text{ Hz}$), single-step manual stepping, pause/resume, and real-time frequency modulation.

### 📊 2. Automated Multi-Variable Truth Table Generator
- Scans all active input sources (`Switches`, `Push Buttons`, `High/Low Rails`, `Clocks`) and outputs (`LEDs`, `Probes`, `7-Segment`, `Hex Displays`).
- Computes $2^N$ combinatorial states automatically.
- Highlights the **current live state** dynamically on the truth table matrix.
- One-click export to **CSV format** for laboratory reports and academic submissions.

### 📈 3. Multi-Channel Timing Waveform Diagram (Oscilloscope)
- Real-time digital signal capture for up to 100 history ticks.
- Simultaneous tracking of inputs, clocks, intermediate logic nodes, and outputs.
- Hover-inspection tooltips for precise signal state inspection at exact timestamps.
- Synchronized with active circuit clock stepping and manual toggles.

### 💾 4. Native `.lgl` Project Architecture
- **Deterministic Portability**: Clean, schema-validated, and human-readable `.lgl` JSON format storing component positions, custom labels, input counts, bit widths, clock states, and exact pin-to-pin wiring topologies.
- **Visual File Association**: Built-in `.lgl` project icons and drag-and-drop file import over the entire canvas workspace.
- **Auto-Save Protection**: Auto-persists work to local workspace storage and provides multi-project management.
- **Vector & Raster Exports**: Export circuit schematics to high-resolution **PNG** or scalable vector graphics (**SVG**).

### 📱 5. Adaptive Desktop & Mobile Ergonomics
- **Responsive Dynamic Viewport (`100dvh`)**: Zero page jumping or address-bar clipping on iOS Safari and Android Chrome.
- **Mobile Bottom Navigation**: Instant switching between Canvas Builder, Truth Table, Waveforms, Components Drawer, and Project Presets.
- **Multi-Touch Gestures**: Seamless pinch-to-zoom, two-finger pan, and smooth touch-point wiring.

---

## 🧰 Component Catalog

LogicGate Lab includes a comprehensive library of fundamental gates, complex integrated circuits, inputs, and output indicators:

| Category | Components Available |
| :--- | :--- |
| **Logic Gates** | `AND`, `OR`, `NOT (Inverter)`, `NAND`, `NOR`, `XOR`, `XNOR`, `BUFFER`, `TRI-STATE BUFFER` |
| **Input Sources** | `Toggle Switch`, `Momentary Push Button`, `VCC (Logic 1)`, `GND (Logic 0)`, `Square-Wave Clock Generator` |
| **Output Probes** | `LED Indicator (Multi-color)`, `Digital 0/1 Probe`, `7-Segment LED Display`, `4-Bit Hexadecimal Display` |
| **Arithmetic ICs** | `Half Adder`, `Full Adder`, `4-Bit Ripple Carry Adder`, `2-to-1 Multiplexer (MUX)`, `4-to-1 Multiplexer` |
| **Sequential Logic** | `SR Latch`, `D Flip-Flop`, `JK Flip-Flop`, `T Flip-Flop`, `4-Bit Binary Counter` |

---

## 🎯 Built-In Modes & Educational Tools

### 1. 🧪 Logic Gate Encyclopedia
A built-in interactive manual explaining every gate's:
- ANSI standard schematic symbol & European rectangular equivalent
- Boolean algebra expression (e.g., $Q = A \oplus B$, $Q = \overline{A \cdot B}$)
- Complete truth table reference
- Real-world transistor implementation concepts (CMOS / TTL)

### 2. 🧩 Boolean Logic Challenges
Level-based puzzles to test and sharpen your circuit engineering skills:
- **Level 1**: Basic inverters and light controllers
- **Level 2**: Exclusive logic and security interlocks
- **Level 3**: Half Adder construction using only NAND gates
- **Level 4**: 2-to-1 multiplexer routing
- **Level 5**: Parity bit generators and arithmetic decoders

### 3. 🎓 Gate Identification Quiz
An interactive gamified knowledge assessment module with timer, scoring, and instant visual verification to test comprehension of digital electronics concepts.

### 4. 📚 Ready-to-Run Preset Circuits
Pre-wired academic reference circuits available instantly from the project menu:
- **Half Adder & Full Adder**
- **4-Bit Binary Adder / Subtractor**
- **SR Flip-Flop & D Latch**
- **2-to-1 Multiplexer (MUX) & Demultiplexer (DEMUX)**
- **4-Bit Ripple Counter with 7-Segment Display**
- **XOR Gate synthesized purely from 4 NAND Gates**

---

## 📄 The `.lgl` File Specification

LogicGate Lab utilizes the open `.lgl` JSON schema to serialize complete circuit topologies:

```json
{
  "fileFormat": "LogicGateLab",
  "version": "2.4.0",
  "project": {
    "id": "proj-1739462800-x9a2",
    "name": "Full Adder Circuit",
    "description": "1-Bit Full Adder built with 2 XORs, 2 ANDs, and 1 OR gate.",
    "createdAt": "2026-08-13T19:30:00.000Z",
    "updatedAt": "2026-08-13T19:45:00.000Z"
  },
  "environment": {
    "clockRunning": true,
    "clockFrequencyHz": 2
  },
  "components": [
    {
      "id": "xor-1",
      "type": "XOR",
      "label": "Sum_L1",
      "x": 240,
      "y": 180,
      "state": 1
    }
  ],
  "connections": [
    {
      "id": "wire-1",
      "from": { "componentId": "switch-a", "portIndex": 0 },
      "to": { "componentId": "xor-1", "portIndex": 0 },
      "state": 1
    }
  ]
}
```

---

## ⌨️ Keyboard Shortcuts & Canvas Controls

| Action | Shortcut (Desktop) | Mouse / Touch Gesture |
| :--- | :--- | :--- |
| **Add Component** | Right-Click Canvas / Click Palette | Tap "+" in Bottom Drawer (Mobile) |
| **Create Wire** | Click source port $\rightarrow$ Click target port | Touch source port $\rightarrow$ Touch target port |
| **Delete Wire** | Right-Click Wire / Select + `Delete` | Tap wire $\rightarrow$ Tap Delete icon |
| **Delete Selected** | `Backspace` or `Delete` | Context toolbar trash button |
| **Pan Canvas** | Space + Drag / Middle Mouse Drag | Two-finger drag |
| **Zoom In / Out** | Mouse Wheel / `Ctrl +` / `Ctrl -` | Pinch to zoom |
| **Reset View (100%)** | `Ctrl + 0` / Reset Zoom button | Zoom toolbar button |
| **Multi-Select** | Click & Drag Selection Box | Drag marquee across components |
| **Undo / Redo** | `Ctrl + Z` / `Ctrl + Y` (or `Ctrl + Shift + Z`) | Header Undo / Redo buttons |
| **Toggle Active Clock**| `Spacebar` (when not panning) | Clock play/pause button |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mujtaba891/Create-Logic-Gates.git
   cd Create-Logic-Gates
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Run production build**:
   ```bash
   npm start
   ```

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + TypeScript
- **Styling & UI**: Tailwind CSS + Lucide Icons + Motion
- **Build System & Dev Server**: Vite + Express + ESBuild
- **Vector Graphics & Canvas Engine**: Native SVG Coordinate Transformation Engine
- **Data Persistence**: Local Storage + Native `.lgl` Serializer / Deserializer

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/Mujtaba891/Create-Logic-Gates/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for digital electronics learners and circuit designers worldwide.</sub>
</div>
