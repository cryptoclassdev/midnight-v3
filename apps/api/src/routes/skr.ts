import { Hono } from "hono";
import { Connection, PublicKey } from "@solana/web3.js";
import { TldParser } from "@onsol/tldparser";

const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

const connection = new Connection(SOLANA_RPC_URL);
const parser = new TldParser(connection);

export const skrRoutes = new Hono();

/** POST /skr/resolve-domain — Resolve .skr domain to wallet address */
skrRoutes.post("/skr/resolve-domain", async (c) => {
  const body = await c.req.json<{ domain?: string }>();
  const domain = body.domain;

  if (!domain || typeof domain !== "string") {
    return c.json({ error: "Domain name is required" }, 400);
  }

  const domainName = domain.replace(/\.skr$/i, "");

  try {
    const owner = await parser.getOwnerFromDomainTld(domainName);
    if (!owner) {
      return c.json({ error: "Domain not found" }, 404);
    }
    const address = typeof owner === "string" ? owner : owner.toBase58();
    return c.json({ address });
  } catch {
    return c.json({ error: "Failed to resolve domain" }, 500);
  }
});

/** POST /skr/resolve-address — Reverse lookup: wallet address to .skr domain */
skrRoutes.post("/skr/resolve-address", async (c) => {
  const body = await c.req.json<{ address?: string }>();
  const address = body.address;

  if (!address || typeof address !== "string") {
    return c.json({ error: "Wallet address is required" }, 400);
  }

  let publicKey: PublicKey;
  try {
    publicKey = new PublicKey(address);
  } catch {
    return c.json({ error: "Invalid wallet address" }, 400);
  }

  try {
    const domains = await parser.getParsedAllUserDomainsFromTld(
      publicKey,
      "skr",
    );
    const first = domains?.[0];
    if (!first) {
      return c.json({ error: "No .skr domain found for this address" }, 404);
    }
    return c.json({ domain: first.domain });
  } catch {
    return c.json({ error: "Failed to resolve address" }, 500);
  }
});
