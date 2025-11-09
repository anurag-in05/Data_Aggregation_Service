import { io as Client, Socket } from "socket.io-client";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app";

let server: any;

describe("WebSocket Live Updates", () => {
  beforeAll(async () => {
    const app = await buildApp();
    server = app.httpServer;
    await new Promise<void>(resolve => server.listen(8083, resolve));
  });

  afterAll(async () => {
    await new Promise<void>(resolve => server.close(resolve));
  });

  it("connects and receives welcome event", async () => {
    const socket: Socket = Client("http://localhost:8083");
    
    const msg = await new Promise<{ msg: string }>(resolve =>
      socket.on("welcome", (data: any) => resolve(data))
    );

    expect(msg.msg).toBeDefined();
    socket.disconnect();
  });
});
