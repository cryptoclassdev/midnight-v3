import { describe, it, expect } from "vitest";
import {
  CreateOrderSchema,
  ClosePositionSchema,
  ClaimPositionSchema,
  formatZodErrors,
} from "./prediction-schemas";
import { USDC_MINT } from "./types";
import { MINIMUM_TRADE_USD } from "./constants";

const VALID_PUBKEY = "7UX2i7SucgLMQcfZ75s3VXmZZY4YRUyJN9X1RgfMoDUi";
const VALID_MARKET_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("CreateOrderSchema", () => {
  it("accepts a valid buy order", () => {
    const result = CreateOrderSchema.safeParse({
      ownerPubkey: VALID_PUBKEY,
      marketId: VALID_MARKET_ID,
      isYes: true,
      isBuy: true,
      depositAmount: "2000000", // $2
      depositMint: USDC_MINT,
    });
    expect(result.success).toBe(true);
  });

  it("defaults depositMint to USDC", () => {
    const result = CreateOrderSchema.safeParse({
      ownerPubkey: VALID_PUBKEY,
      marketId: VALID_MARKET_ID,
      isYes: false,
      isBuy: true,
      depositAmount: "5000000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.depositMint).toBe(USDC_MINT);
    }
  });

  it("rejects buy without marketId", () => {
    const result = CreateOrderSchema.safeParse({
      ownerPubkey: VALID_PUBKEY,
      isYes: true,
      isBuy: true,
      depositAmount: "2000000",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodErrors(result.error)).toContain("marketId");
    }
  });

  it("rejects buy without depositAmount", () => {
    const result = CreateOrderSchema.safeParse({
      ownerPubkey: VALID_PUBKEY,
      marketId: VALID_MARKET_ID,
      isYes: true,
      isBuy: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodErrors(result.error)).toContain("depositAmount");
    }
  });

  it("rejects buy below minimum trade amount", () => {
    const belowMinMicro = String(Math.floor(MINIMUM_TRADE_USD * 1_000_000) - 1);
    const result = CreateOrderSchema.safeParse({
      ownerPubkey: VALID_PUBKEY,
      marketId: VALID_MARKET_ID,
      isYes: true,
      isBuy: true,
      depositAmount: belowMinMicro,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodErrors(result.error)).toContain("Minimum trade");
    }
  });

  it("accepts a valid sell order", () => {
    const result = CreateOrderSchema.safeParse({
      ownerPubkey: VALID_PUBKEY,
      positionPubkey: VALID_PUBKEY,
      isYes: true,
      isBuy: false,
      contracts: "10",
    });
    expect(result.success).toBe(true);
  });

  it("rejects sell without positionPubkey", () => {
    const result = CreateOrderSchema.safeParse({
      ownerPubkey: VALID_PUBKEY,
      isYes: true,
      isBuy: false,
      contracts: "10",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodErrors(result.error)).toContain("positionPubkey");
    }
  });

  it("rejects sell without contracts", () => {
    const result = CreateOrderSchema.safeParse({
      ownerPubkey: VALID_PUBKEY,
      positionPubkey: VALID_PUBKEY,
      isYes: true,
      isBuy: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatZodErrors(result.error)).toContain("contracts");
    }
  });

  it("rejects invalid pubkey", () => {
    const result = CreateOrderSchema.safeParse({
      ownerPubkey: "not-a-pubkey!",
      marketId: VALID_MARKET_ID,
      isYes: true,
      isBuy: true,
      depositAmount: "2000000",
    });
    expect(result.success).toBe(false);
  });
});

describe("ClosePositionSchema", () => {
  it("accepts valid close request", () => {
    const result = ClosePositionSchema.safeParse({
      positionPubkey: VALID_PUBKEY,
      ownerPubkey: VALID_PUBKEY,
      isYes: true,
      contracts: "5",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing contracts", () => {
    const result = ClosePositionSchema.safeParse({
      positionPubkey: VALID_PUBKEY,
      ownerPubkey: VALID_PUBKEY,
      isYes: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid pubkey", () => {
    const result = ClosePositionSchema.safeParse({
      positionPubkey: "bad",
      ownerPubkey: VALID_PUBKEY,
      isYes: false,
      contracts: "1",
    });
    expect(result.success).toBe(false);
  });
});

describe("ClaimPositionSchema", () => {
  it("accepts valid claim request", () => {
    const result = ClaimPositionSchema.safeParse({
      positionPubkey: VALID_PUBKEY,
      ownerPubkey: VALID_PUBKEY,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing ownerPubkey", () => {
    const result = ClaimPositionSchema.safeParse({
      positionPubkey: VALID_PUBKEY,
    });
    expect(result.success).toBe(false);
  });
});
