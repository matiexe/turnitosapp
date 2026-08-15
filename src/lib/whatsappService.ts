export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
}

export function getEvolutionConfig(): EvolutionConfig {
  const url = (process.env.EVOLUTION_API_URL || '').replace(/\/+$/, '');
  return {
    baseUrl: url,
    apiKey: process.env.EVOLUTION_API_KEY || 'tuturnito_master_secret_key_2026'
  };
}

export function formatWhatsappNumber(recipientNumber: string): string {
  let clean = recipientNumber.replace(/[^0-9]/g, '');

  // Remove leading zero if present (e.g. 01112345678 -> 1112345678)
  if (clean.startsWith('0')) {
    clean = clean.substring(1);
  }

  // Argentine 10-digit number (e.g. 1112345678 -> 5491112345678)
  if (clean.length === 10) {
    clean = '549' + clean;
  } else if (clean.startsWith('54') && !clean.startsWith('549')) {
    // 541112345678 -> 5491112345678
    clean = '549' + clean.substring(2);
  }

  return clean;
}

export async function createEvolutionInstance(instanceName: string) {
  const { baseUrl, apiKey } = getEvolutionConfig();
  if (!baseUrl) return { success: false, error: 'EVOLUTION_API_URL no configurado' };

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
  if (!baseUrl) return { success: false, error: 'EVOLUTION_API_URL no configurado' };

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
  if (!baseUrl) return { success: false, error: 'EVOLUTION_API_URL no configurado' };

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

  if (!baseUrl || baseUrl.includes('tuturnito.app')) {
    return { success: false, error: 'EVOLUTION_API_URL no está configurado en las variables de Vercel.' };
  }

  const cleanNumber = formatWhatsappNumber(recipientNumber);

  try {
    const res = await fetch(`${baseUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: text,
        options: {
          delay: 1200,
          presence: 'composing'
        },
        textMessage: {
          text: text
        }
      })
    });

    const json = await res.json();

    if (!res.ok || json.error || json.statusCode >= 400) {
      return {
        success: false,
        error: json.message || json.error || `Error HTTP ${res.status} al enviar mensaje por WhatsApp.`,
        rawResponse: json
      };
    }

    return {
      success: true,
      data: json
    };
  } catch (err: any) {
    console.error('Error sending WhatsApp text via Evolution API:', err);
    return { success: false, error: err.message };
  }
}

export async function disconnectEvolutionInstance(instanceName: string) {
  const { baseUrl, apiKey } = getEvolutionConfig();
  if (!baseUrl) return { success: false, error: 'EVOLUTION_API_URL no configurado' };

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
