type PayPalMode = "sandbox" | "live";

type PayPalAmountBreakdown = {
  item_total?: {
    currency_code: string;
    value: string;
  };
};

type PayPalItem = {
  name: string;
  quantity: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
};

type PayPalPurchaseUnit = {
  reference_id?: string;
  custom_id?: string;
  items?: PayPalItem[];
  amount: {
    currency_code: string;
    value: string;
    breakdown?: PayPalAmountBreakdown;
  };
};

type PayPalOrderPayload = {
  intent: "CAPTURE";
  purchase_units: PayPalPurchaseUnit[];
  application_context: {
    return_url: string;
    cancel_url: string;
    user_action?: "PAY_NOW";
    shipping_preference?: "SET_PROVIDED_ADDRESS" | "GET_FROM_FILE" | "NO_SHIPPING";
  };
};

class PayPalApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PayPalApiError";
    this.status = status;
  }
}

function getPayPalMode(): PayPalMode {
  const mode = process.env.PAYPAL_MODE;

  if (mode === "live") {
    return "live";
  }

  return "sandbox";
}

function getPayPalBaseUrl() {
  return getPayPalMode() === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function getRequiredEnv(name: "PAYPAL_CLIENT_ID" | "PAYPAL_CLIENT_SECRET" | "PAYPAL_WEBHOOK_ID") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

async function parsePayPalResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T & { message?: string; error_description?: string }) : ({} as T);

  if (!response.ok) {
    const message =
      (typeof data === "object" && data !== null && "message" in data && data.message) ||
      (typeof data === "object" && data !== null && "error_description" in data && data.error_description) ||
      "PayPal request failed.";

    throw new PayPalApiError(String(message), response.status);
  }

  return data;
}

export function formatPayPalAmount(amount: number) {
  return amount.toFixed(2);
}

export async function getPayPalAccessToken() {
  const clientId = getRequiredEnv("PAYPAL_CLIENT_ID");
  const clientSecret = getRequiredEnv("PAYPAL_CLIENT_SECRET");
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await parsePayPalResponse<{ access_token: string }>(response);
  return data.access_token;
}

export async function createPayPalOrder(payload: PayPalOrderPayload) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parsePayPalResponse<{
    id: string;
    status: string;
    links?: Array<{
      href: string;
      rel: string;
      method: string;
    }>;
  }>(response);
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return parsePayPalResponse<{
    id: string;
    status: string;
    purchase_units?: Array<{
      reference_id?: string;
      custom_id?: string;
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
        }>;
      };
    }>;
  }>(response);
}

export async function verifyPayPalWebhookSignature(webhookEvent: unknown, headers: Headers) {
  const authAlgo = headers.get("paypal-auth-algo");
  const certUrl = headers.get("paypal-cert-url");
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const transmissionTime = headers.get("paypal-transmission-time");

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false;
  }

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: getRequiredEnv("PAYPAL_WEBHOOK_ID"),
      webhook_event: webhookEvent,
    }),
  });

  const data = await parsePayPalResponse<{ verification_status: string }>(response);
  return data.verification_status === "SUCCESS";
}

export { PayPalApiError };
