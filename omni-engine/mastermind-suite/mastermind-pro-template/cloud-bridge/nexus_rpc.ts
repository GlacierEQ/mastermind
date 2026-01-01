/**
 * THE NEXUS BRIDGE: Secure RPC calls from Frontend to Mastermind Agents.
 */
export const callNexusAgent = async (agentId: string, payload: any) => {
  const NEXUS_ENDPOINT = process.env.NEXUS_ENDPOINT;
  const NEXUS_KEY = process.env.NEXUS_KEY;

  const response = await fetch(`${NEXUS_ENDPOINT}/functions/v1/mastermind-agent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NEXUS_KEY}`,
      'Content-Type': 'application/json'
    },
    body: json.stringify({ agentId, payload, timestamp: new Date().toISOString() })
  });

  return await response.json();
};
