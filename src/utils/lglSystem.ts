import { CircuitComponent, Wire, GateType, UserProject } from '../types';
import { createComponentPorts } from './logicEngine';

export interface LGLComponent {
  id: string;
  type: GateType;
  label?: string;
  position: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  rotation?: 0 | 90 | 180 | 270;
  properties?: {
    value?: boolean;
    clockFrequencyMs?: number;
    color?: string;
    inputCount?: number;
    [key: string]: any;
  };
}

export interface LGLConnection {
  id: string;
  from: {
    component: string;
    port: string;
  };
  to: {
    component: string;
    port: string;
  };
  routing?: {
    mode?: string;
    points?: { x: number; y: number }[];
  };
}

export interface LGLGroup {
  id: string;
  name: string;
  componentIds: string[];
}

export interface LGLProjectFile {
  format: 'LogicGateLab';
  formatVersion: number;
  appVersion: string;

  project: {
    id: string;
    name: string;
    description?: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
  };

  settings?: {
    grid?: {
      enabled: boolean;
      size: number;
      snap: boolean;
    };
    theme?: string;
    simulation?: {
      autoEvaluate?: boolean;
      clockSpeed?: number;
    };
  };

  canvas?: {
    width?: number;
    height?: number;
    zoom?: number;
    offsetX?: number;
    offsetY?: number;
  };

  components: LGLComponent[];
  connections: LGLConnection[];
  groups?: LGLGroup[];
  customComponents?: any[];

  simulation?: {
    running?: boolean;
    time?: number;
  };

  truthTable?: {
    enabled?: boolean;
    inputComponentIds?: string[];
    outputComponentIds?: string[];
  };

  waveform?: {
    enabled?: boolean;
    timeScale?: number;
    signals?: string[];
  };

  metadata?: {
    source?: string;
    generator?: string;
    tags?: string[];
  };
}

export interface LGLValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  details?: {
    format?: string;
    formatVersion?: number;
    componentCount?: number;
    connectionCount?: number;
  };
}

const VALID_GATE_TYPES: Set<string> = new Set([
  'AND',
  'OR',
  'NOT',
  'NAND',
  'NOR',
  'XOR',
  'XNOR',
  'BUFFER',
  'INPUT',
  'CLOCK',
  'HIGH',
  'LOW',
  'OUTPUT',
  'HEX_OUTPUT',
  'SEVEN_SEGMENT',
  'HALF_ADDER',
  'FULL_ADDER',
  'MUX_21',
]);

/**
 * Validates a parsed object against the official LogicGate Lab (.lgl) schema requirements.
 */
export function validateLGL(data: any): LGLValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: ['File content is not a valid JSON object.'],
      warnings: [],
    };
  }

  // Security Validation: Check for script or code injection vectors
  const stringified = JSON.stringify(data);
  const dangerousPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /eval\(/i,
    /Function\(/i,
    /onload=/i,
    /onerror=/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(stringified)) {
      return {
        valid: false,
        errors: ['Security Violation: Executable script or code injection payload detected in file.'],
        warnings: [],
      };
    }
  }

  // 1. Format Identity
  if (data.format !== 'LogicGateLab') {
    errors.push(`Invalid format identifier: expected "LogicGateLab", found "${data.format || 'none'}".`);
  }

  // 2. Format Version
  if (typeof data.formatVersion !== 'number') {
    errors.push('Missing or invalid "formatVersion" field (must be a number).');
  } else if (data.formatVersion > 1) {
    warnings.push(`File formatVersion is ${data.formatVersion}, which is higher than current system version 1.`);
  }

  // 3. Project Metadata
  if (!data.project || typeof data.project !== 'object') {
    errors.push('Missing "project" metadata object.');
  } else {
    if (!data.project.id || typeof data.project.id !== 'string') {
      errors.push('Project object missing required "id" string.');
    }
    if (!data.project.name || typeof data.project.name !== 'string') {
      errors.push('Project object missing required "name" string.');
    }
  }

  // 4. Components Array & References
  const componentIds = new Set<string>();
  if (!Array.isArray(data.components)) {
    errors.push('Missing or invalid "components" array.');
  } else {
    data.components.forEach((comp: any, idx: number) => {
      if (!comp || typeof comp !== 'object') {
        errors.push(`Component at index ${idx} is not an object.`);
        return;
      }
      if (!comp.id || typeof comp.id !== 'string') {
        errors.push(`Component at index ${idx} missing required "id".`);
      } else {
        if (componentIds.has(comp.id)) {
          errors.push(`Duplicate component ID found: "${comp.id}".`);
        }
        componentIds.add(comp.id);
      }

      if (!comp.type || typeof comp.type !== 'string') {
        errors.push(`Component "${comp.id || idx}" missing required "type".`);
      } else if (!VALID_GATE_TYPES.has(comp.type)) {
        errors.push(`Component "${comp.id}" uses unsupported type "${comp.type}".`);
      }

      if (!comp.position || typeof comp.position.x !== 'number' || typeof comp.position.y !== 'number') {
        errors.push(`Component "${comp.id || idx}" has invalid position coordinates.`);
      }
    });
  }

  // 5. Connections Array & Port Validation
  if (!Array.isArray(data.connections)) {
    errors.push('Missing or invalid "connections" array.');
  } else {
    data.connections.forEach((conn: any, idx: number) => {
      if (!conn || typeof conn !== 'object') {
        errors.push(`Connection at index ${idx} is not an object.`);
        return;
      }
      if (!conn.id || typeof conn.id !== 'string') {
        errors.push(`Connection at index ${idx} missing required "id".`);
      }

      if (!conn.from || typeof conn.from.component !== 'string' || typeof conn.from.port !== 'string') {
        errors.push(`Connection "${conn.id || idx}" has invalid "from" reference.`);
      } else if (!componentIds.has(conn.from.component)) {
        errors.push(`Connection "${conn.id}" references non-existent source component "${conn.from.component}".`);
      }

      if (!conn.to || typeof conn.to.component !== 'string' || typeof conn.to.port !== 'string') {
        errors.push(`Connection "${conn.id || idx}" has invalid "to" reference.`);
      } else if (!componentIds.has(conn.to.component)) {
        errors.push(`Connection "${conn.id}" references non-existent target component "${conn.to.component}".`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    details: {
      format: data.format,
      formatVersion: data.formatVersion,
      componentCount: Array.isArray(data.components) ? data.components.length : 0,
      connectionCount: Array.isArray(data.connections) ? data.connections.length : 0,
    },
  };
}

/**
 * Serializes internal project state into canonical deterministic .lgl format.
 */
export function serializeToLGL(
  project: Partial<UserProject> & { id: string; name: string },
  components: CircuitComponent[],
  wires: Wire[],
  options?: {
    description?: string;
    author?: string;
    clockRunning?: boolean;
  }
): LGLProjectFile {
  const nowIso = new Date().toISOString();

  // Map internal components to LGL schema components
  const lglComponents: LGLComponent[] = components.map((c) => ({
    id: c.id,
    type: c.type,
    label: c.label || c.type,
    position: {
      x: c.x,
      y: c.y,
    },
    rotation: c.rotation || 0,
    properties: {
      value: c.state,
      clockFrequencyMs: c.clockFrequencyMs,
      color: c.color,
      inputCount: c.inputCount,
    },
  }));

  // Map internal wires to LGL schema connections
  const lglConnections: LGLConnection[] = wires.map((w) => ({
    id: w.id,
    from: {
      component: w.fromCompId,
      port: w.fromPortId,
    },
    to: {
      component: w.toCompId,
      port: w.toPortId,
    },
  }));

  // Canonical deterministic key order
  const lglFile: LGLProjectFile = {
    format: 'LogicGateLab',
    formatVersion: 1,
    appVersion: '1.0.0',

    project: {
      id: project.id || `proj_${Date.now()}`,
      name: project.name || 'Logic Circuit',
      description: options?.description || project.description || 'LogicGate Lab Project Circuit',
      author: options?.author || 'LogicGate Lab User',
      createdAt: project.createdAt ? new Date(project.createdAt).toISOString() : nowIso,
      updatedAt: nowIso,
    },

    settings: {
      grid: {
        enabled: true,
        size: 20,
        snap: true,
      },
      theme: 'dark',
      simulation: {
        autoEvaluate: true,
        clockSpeed: 1000,
      },
    },

    canvas: {
      width: 2000,
      height: 1200,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    },

    components: lglComponents,
    connections: lglConnections,
    groups: [],
    customComponents: [],

    simulation: {
      running: !!options?.clockRunning,
      time: Date.now(),
    },

    truthTable: {
      enabled: true,
      inputComponentIds: components.filter((c) => c.type === 'INPUT' || c.type === 'CLOCK').map((c) => c.id),
      outputComponentIds: components.filter((c) => c.type === 'OUTPUT').map((c) => c.id),
    },

    waveform: {
      enabled: false,
      timeScale: 1,
      signals: components.map((c) => c.id),
    },

    metadata: {
      source: 'manual',
      generator: 'LogicGateLab',
      tags: ['digital-logic', 'circuit'],
    },
  };

  return lglFile;
}

/**
 * Parses and validates an imported .lgl file content string, handling legacy JSON migrations.
 */
export function parseAndValidateLGL(jsonStr: string): {
  valid: boolean;
  project?: UserProject;
  components?: CircuitComponent[];
  wires?: Wire[];
  report: LGLValidationReport;
} {
  let rawData: any;
  try {
    rawData = JSON.parse(jsonStr);
  } catch (err: any) {
    return {
      valid: false,
      report: {
        valid: false,
        errors: [`JSON syntax error: ${err.message}`],
        warnings: [],
      },
    };
  }

  // Migration layer: Upgrade legacy JSON exports automatically to .lgl format
  if (rawData && typeof rawData === 'object' && rawData.format !== 'LogicGateLab') {
    if (Array.isArray(rawData.components) && Array.isArray(rawData.wires)) {
      // Convert legacy structure to LGL v1
      const legacyName = rawData.name || 'Imported Circuit';
      const migrated = serializeToLGL(
        {
          id: `proj-${Date.now()}`,
          name: legacyName,
        },
        rawData.components.map((c: any) => ({
          ...c,
          x: c.x ?? c.position?.x ?? 200,
          y: c.y ?? c.position?.y ?? 200,
        })),
        rawData.wires.map((w: any) => ({
          ...w,
          fromCompId: w.fromCompId ?? w.from?.component,
          fromPortId: w.fromPortId ?? w.from?.port,
          toCompId: w.toCompId ?? w.to?.component,
          toPortId: w.toPortId ?? w.to?.port,
        }))
      );
      rawData = migrated;
    }
  }

  const report = validateLGL(rawData);
  if (!report.valid) {
    return {
      valid: false,
      report,
    };
  }

  const lglFile = rawData as LGLProjectFile;

  // Reconstruct runtime internal components and ports from registry
  const reconstructedComponents: CircuitComponent[] = lglFile.components.map((c) => {
    const ports = createComponentPorts(c.type, c.id, c.properties?.inputCount || 2);
    return {
      id: c.id,
      type: c.type,
      label: c.label || c.type,
      x: c.position.x,
      y: c.position.y,
      rotation: c.rotation || 0,
      state: c.properties?.value ?? (c.type === 'HIGH'),
      clockFrequencyMs: c.properties?.clockFrequencyMs,
      color: c.properties?.color,
      inputCount: c.properties?.inputCount,
      inputs: ports.inputs,
      outputs: ports.outputs,
    };
  });

  // Helper to resolve port string references to actual component port IDs
  const resolvePortId = (compId: string, portRef: string, isOutput: boolean): string => {
    const comp = reconstructedComponents.find((c) => c.id === compId);
    if (!comp) return portRef;

    const ports = isOutput ? comp.outputs : comp.inputs;
    if (!ports || ports.length === 0) return portRef;

    // 1. Direct exact match
    const exact = ports.find((p) => p.id === portRef);
    if (exact) return exact.id;

    // 2. Prefix match `${compId}-${portRef}`
    const compPrefixMatch = ports.find((p) => p.id === `${compId}-${portRef}`);
    if (compPrefixMatch) return compPrefixMatch.id;

    // 3. Name match (e.g. 'A', 'B', 'OUT', 'Sum', 'Carry')
    const nameMatch = ports.find((p) => p.name.toLowerCase() === portRef.toLowerCase());
    if (nameMatch) return nameMatch.id;

    // 4. Index-based match for schema references like 'in1', 'in2', 'out0', etc.
    const digits = portRef.match(/\d+/);
    if (digits) {
      const idx = parseInt(digits[0], 10);
      const targetIdx = idx > 0 && idx <= ports.length && portRef.toLowerCase().includes('in') ? idx - 1 : idx;
      if (ports[targetIdx]) return ports[targetIdx].id;
    }

    // 5. Fallback to first available port
    return ports[0].id;
  };

  // Reconstruct internal wires from connection graph
  const reconstructedWires: Wire[] = lglFile.connections.map((conn) => ({
    id: conn.id || `wire_${Math.random().toString(36).substring(2, 8)}`,
    fromCompId: conn.from.component,
    fromPortId: resolvePortId(conn.from.component, conn.from.port, true),
    toCompId: conn.to.component,
    toPortId: resolvePortId(conn.to.component, conn.to.port, false),
  }));

  const project: UserProject = {
    id: lglFile.project.id,
    name: lglFile.project.name,
    description: lglFile.project.description,
    createdAt: lglFile.project.createdAt ? new Date(lglFile.project.createdAt).getTime() : Date.now(),
    updatedAt: lglFile.project.updatedAt ? new Date(lglFile.project.updatedAt).getTime() : Date.now(),
    components: reconstructedComponents,
    wires: reconstructedWires,
  };

  return {
    valid: true,
    project,
    components: reconstructedComponents,
    wires: reconstructedWires,
    report,
  };
}

/**
 * Triggers a file download for an .lgl project file.
 * Guarantees that the filename always ends with .lgl and uses application/x-logicgate-lab MIME type.
 */
export function downloadLGLProject(
  project: Partial<UserProject> & { id: string; name: string },
  components: CircuitComponent[],
  wires: Wire[],
  options?: { clockRunning?: boolean }
) {
  const lglData = serializeToLGL(project, components, wires, options);
  const jsonStr = JSON.stringify(lglData, null, 2);

  // Ensure file extension is strictly .lgl without duplicate extensions
  let baseName = (project.name || 'logic_circuit')
    .trim()
    .replace(/\.lgl$/i, '')
    .replace(/\.json$/i, '')
    .replace(/\.circuit$/i, '')
    .replace(/\.logic$/i, '');

  if (!baseName) baseName = 'logic_circuit';

  const fileName = `${baseName}.lgl`;

  const blob = new Blob([jsonStr], { type: 'application/x-logicgate-lab;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = fileName;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
}
