// Serializable receipt DTOs returned by GET /api/receipts. See CLAUDE.md §9.
// Decimal/Date are stringified at the query layer so the shape crosses the API.

export type ReceiptStatus = "PENDING" | "SUCCEEDED" | "FAILED";

export type ReceiptListItem = {
  id: string;
  querySessionId: string;
  totalAmountUsd: string;
  status: ReceiptStatus;
  txHash: string | null;
  // Circle settlement reference on success; the provider's failure reason on a
  // FAILED receipt so the cause is visible in the UI without server logs.
  providerReference: string | null;
  isMock: boolean;
  createdAt: string;
};

export type ListReceiptsResponse = {
  receipts: ReceiptListItem[];
};
