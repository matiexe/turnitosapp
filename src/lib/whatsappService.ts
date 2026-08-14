export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
}

export function getEvolutionConfig(): EvolutionConfig {
  return {
    baseUrl: process.env.EVOLUTION_API_URL || 'https://evolution.tuturnito.app',
    apiKey: process.env.EVOLUTION_API_KEY || 'tuturnito_master_secret_key_2026'
  };
}

export async function createEvolutionInstance(instanceName: string) {
  const { baseUrl, apiKey } = getEvolutionConfig();
  try {
    const res = await fetch(`${baseUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        instanceName,
        token: instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      })
    });
    return await res.json();
  } catch (err: any) {
    console.error('Error creating Evolution API instance:', err);
    return { success: false, error: err.message };
  }
}

export async function getEvolutionQRCode(instanceName: string) {
  const { baseUrl, apiKey } = getEvolutionConfig();
  try {
    const res = await fetch(`${baseUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey
      }
    });
    return await res.json();
  } catch (err: any) {
    console.error('Error fetching Evolution QR Code:', err);
    return { success: false, error: err.message };
  }
}

export async function getEvolutionConnectionState(instanceName: string) {
  const { baseUrl, apiKey } = getEvolutionConfig();
  try {
    const res = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey
      }
    });
    return await res.json();
  } catch (err: any) {
    console.error('Error fetching Evolution connection state:', err);
    return { success: false, error: err.message };
  }
}

export async function sendEvolutionTextMessage(instanceName: string, recipientNumber: string, text: string) {
  const { baseUrl, apiKey } = getEvolutionConfig();
  // Format number: e.g. 5491112345678
  let cleanNumber = recipientNumber.replace(/[^0-9]/g, '');
  if (!cleanNumber.startsWith('549') && cleanNumber.startsWith('54')) {
    cleanNumber = '549' + cleanNumber.substring(2);
  }

  try {
    const res = await fetch(`${baseUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: cleanNumber,
        options: {
          delay: 1200,
          presence: 'composing'
        },
        textMessage: {
          text
        }
      })
    });
    return await res.json();
  } catch (err: any) {
    console.error('Error sending WhatsApp text via Evolution API:', err);
    return { success: false, error: err.message };
  }
}

export async function disconnectEvolutionInstance(instanceName: string) {
  const { baseUrl, apiKey } = getEvolutionConfig();
  try {
    const res = await fetch(`${baseUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': apiKey
      }
    });
    return await res.json();
  } catch (err: any) {
    console.error('Error disconnecting Evolution instance:', err);
    return { success: false, error: err.message };
  }
}
