import { CircuitComponent, Wire, TruthTableData, UserProject } from '../types';
import { downloadLGLProject } from './lglSystem';

export function exportCircuitToLGL(
  project: Partial<UserProject> & { id: string; name: string },
  components: CircuitComponent[],
  wires: Wire[],
  options?: { clockRunning?: boolean }
) {
  downloadLGLProject(project, components, wires, options);
}

// Backward-compatible alias for existing callers
export function exportCircuitToJSON(
  components: CircuitComponent[],
  wires: Wire[],
  name = 'logic_circuit'
) {
  downloadLGLProject(
    { id: `proj-${Date.now()}`, name },
    components,
    wires
  );
}

export function exportTruthTableToCSV(truthTable: TruthTableData, filename = 'truth_table') {
  if (!truthTable.rows || truthTable.rows.length === 0) return;

  const headers = [...truthTable.inputLabels, ...truthTable.outputLabels].join(',');
  const rowStrings = truthTable.rows.map((row) => {
    const inVals = truthTable.inputLabels.map((lbl) => (row.inputs[lbl] ? '1' : '0'));
    const outVals = truthTable.outputLabels.map((lbl) => (row.outputs[lbl] ? '1' : '0'));
    return [...inVals, ...outVals].join(',');
  });

  const csvContent = [headers, ...rowStrings].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCanvasToPNG(svgElement: SVGSVGElement | null, filename = 'circuit_diagram') {
  if (!svgElement) return;

  try {
    const xml = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Use bounding rect or fallback dimensions
      const bbox = svgElement.getBoundingClientRect();
      canvas.width = Math.max(bbox.width * 2, 1200); // High DPI
      canvas.height = Math.max(bbox.height * 2, 800);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dark background for blueprint style
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${filename}.png`;
        downloadLink.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  } catch (e) {
    console.error('Failed to export canvas to PNG:', e);
  }
}

export function exportCanvasToSVG(svgElement: SVGSVGElement | null, filename = 'circuit_diagram') {
  if (!svgElement) return;

  const xml = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}
