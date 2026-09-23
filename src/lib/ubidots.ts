const UBIDOTS_BASE_URL = "https://industrial.api.ubidots.com/api/v1.6";

const ubidotsConfig = {
  presence: {
    datasourceId:
      import.meta.env.VITE_UBIDOTS_PRESENCE_DEVICE_ID ||
      "6ab3f1ebc4a5e17a9561ecdc",
    token:
      import.meta.env.VITE_UBIDOTS_PRESENCE_TOKEN ||
      "BBUS-ja9aadqIaozN5L7nayeJxLICeccm1D",
    variableLabel:
      import.meta.env.VITE_UBIDOTS_PRESENCE_VARIABLE_LABEL || "ultrason",
  },
  gas: {
    datasourceId:
      import.meta.env.VITE_UBIDOTS_GAS_DEVICE_ID || "6ab3f4f17051752ffaf54d03",
    token:
      import.meta.env.VITE_UBIDOTS_GAS_TOKEN ||
      "BBUS-ja9aadqIaozN5L7nayeJxLICeccm1D",
    variableLabel:
      import.meta.env.VITE_UBIDOTS_GAS_VARIABLE_LABEL || "capteur_gaz",
  },
};

type SensorKey = keyof typeof ubidotsConfig;

interface UbidotsVariable {
  id: string;
  label: string;
  last_value?: {
    value: number;
    timestamp: number;
  };
}

interface UbidotsValuesResponse {
  results: Array<{
    value: number;
    timestamp: number;
    created_at: number;
  }>;
}

export interface SensorPoint {
  value: number;
  timestamp: number;
}

export interface SensorReading {
  current: SensorPoint | null;
  history: SensorPoint[];
}

const variableIdCache = new Map<SensorKey, string>();

async function ubidotsFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${UBIDOTS_BASE_URL}${path}`, {
    headers: {
      "X-Auth-Token": token,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Ubidots API error (${response.status})`);
  }

  return response.json() as Promise<T>;
}

async function resolveVariableId(sensor: SensorKey): Promise<string> {
  const cachedId = variableIdCache.get(sensor);
  if (cachedId) {
    return cachedId;
  }

  const { datasourceId, token, variableLabel } = ubidotsConfig[sensor];
  const data = await ubidotsFetch<{ results: UbidotsVariable[] }>(
    `/datasources/${datasourceId}/variables`,
    token,
  );

  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(`No variables found for datasource ${datasourceId}`);
  }

  const variable =
    data.results.find((item) => item.label === variableLabel) ||
    data.results.find((item) =>
      item.label.toLowerCase().includes(variableLabel.toLowerCase()),
    ) ||
    data.results[0];

  variableIdCache.set(sensor, variable.id);
  return variable.id;
}

async function fetchSensorReading(
  sensor: SensorKey,
  pageSize = 24,
): Promise<SensorReading> {
  const variableId = await resolveVariableId(sensor);
  const token = ubidotsConfig[sensor].token;

  const data = await ubidotsFetch<UbidotsValuesResponse>(
    `/variables/${variableId}/values?page_size=${pageSize}`,
    token,
  );

  const history = (data.results || [])
    .map((item) => ({
      value: item.value,
      timestamp: item.timestamp || item.created_at,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  const current = history.length > 0 ? history[history.length - 1] : null;

  return {
    current,
    history,
  };
}

export function fetchPresenceReading(pageSize = 30) {
  return fetchSensorReading("presence", pageSize);
}

export function fetchGasReading(pageSize = 30) {
  return fetchSensorReading("gas", pageSize);
}
