import { getConfig } from "./config";

export interface DecryptItem {
  content: string;
  type: string;
}

export interface DecryptResult {
  content: string;
  raw_content: string;
}

interface AjaxFailureData {
  error_code?: string;
  message?: string;
}

interface AjaxEnvelope<Data> {
  success: boolean;
  data?: Data;
}

interface FreshNonceData {
  nonce: string;
}

interface DecryptSuccessData {
  results: Record<number, DecryptResult | null>;
}

type DecryptEnvelope = AjaxEnvelope<DecryptSuccessData | AjaxFailureData | string>;

const refreshNonce = async (): Promise<boolean> => {
  const config = getConfig();
  const formData = new FormData();
  formData.append("action", "kotlinskidev_get_fresh_nonce");

  const response = await fetch(config.ajaxUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return false;
  }

  const result: AjaxEnvelope<FreshNonceData> = await response.json();

  if (result.success) {
    getConfig().nonce = result.data!.nonce;
    return true;
  }

  return false;
};

const describeFailure = (data: DecryptEnvelope["data"]): string => {
  const message = typeof data === "object" ? (data as AjaxFailureData | undefined)?.message : "";
  return String(message || data || "Unknown decryption error");
};

const isNonceExpired = (data: DecryptEnvelope["data"]): boolean =>
  typeof data === "object" && (data as AjaxFailureData | undefined)?.error_code === "nonce_expired";

export const fetchDecryptedItems = async (
  items: DecryptItem[],
  hasRetried = false
): Promise<Record<number, DecryptResult | null>> => {
  const config = getConfig();
  const formData = new FormData();
  formData.append("action", "kotlinskidev_decrypt_content");
  formData.append("items", JSON.stringify(items));
  formData.append("nonce", config.nonce);

  const response = await fetch(config.ajaxUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: DecryptEnvelope = await response.json();

  if (result.success) {
    return (result.data as DecryptSuccessData).results;
  }

  if (isNonceExpired(result.data) && !hasRetried && (await refreshNonce())) {
    return fetchDecryptedItems(items, true);
  }

  throw new Error(describeFailure(result.data));
};

export const decryptText = async (
  encryptedText: string,
  type: string = "text"
): Promise<string> => {
  const results = await fetchDecryptedItems([{ content: encryptedText, type }]);
  const result = results[0];

  if (!result) {
    throw new Error("Unknown decryption error");
  }

  return result.raw_content;
};
