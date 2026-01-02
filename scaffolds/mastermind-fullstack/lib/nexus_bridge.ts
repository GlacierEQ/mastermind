/**
 * Mastermind Nexus Bridge
 * Connects the High-End Frontend to the Zenith Nexus Logic Empire.
 */

export const NEXUS_API_URL = process.env.NEXT_PUBLIC_NEXUS_API_URL || 'http://localhost:8000';
export const OPERATOR_GUID = '983DE8C8-E120-1-B5A0-C6D8AF97BB09';

export async function swarmQuery(query: string) {
  const response = await fetch(`${NEXUS_API_URL}/swarm/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, guid: OPERATOR_GUID }),
  });
  return response.json();
}

export async function getMemoryPulse() {
  const response = await fetch(`${NEXUS_API_URL}/swarm/pulse_status`);
  return response.json();
}
