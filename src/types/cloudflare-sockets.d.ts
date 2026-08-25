// Minimal, hand-scoped type declarations for the Cloudflare Workers TCP Sockets
// API (https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/).
//
// Deliberately NOT generated via `wrangler types --include-runtime`: that flag
// dumps the entire Workers runtime type library as bare global ambient
// declarations, including an HTMLRewriter `Element` interface that collides
// with the browser DOM's `Element` (used throughout this project's client
// scripts, e.g. `document.querySelector<HTMLSelectElement>(...)`), breaking
// type-checking site-wide. A `declare module` block only affects code that
// imports from that exact module specifier, so it can't leak into or collide
// with the global scope the way ambient globals do.
//
// If more of the Workers runtime API surface is needed later, extend this
// file with the specific interfaces required rather than re-enabling
// `--include-runtime`.

declare module "cloudflare:sockets" {
  interface SocketAddress {
    hostname: string;
    port: number;
  }

  interface SocketOptions {
    secureTransport?: string;
    allowHalfOpen?: boolean;
    highWaterMark?: number | bigint;
  }

  interface SocketInfo {
    remoteAddress?: string;
    localAddress?: string;
  }

  interface TlsOptions {
    expectedServerHostname?: string;
  }

  interface Socket {
    readonly readable: ReadableStream;
    readonly writable: WritableStream;
    readonly closed: Promise<void>;
    readonly opened: Promise<SocketInfo>;
    readonly upgraded: boolean;
    readonly secureTransport: "on" | "off" | "starttls";
    close(): Promise<void>;
    startTls(options?: TlsOptions): Socket;
  }

  function connect(address: string | SocketAddress, options?: SocketOptions): Socket;
}
