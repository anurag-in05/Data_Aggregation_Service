import { Server as SocketIOServer } from "socket.io";
import { IncomingMessage, ServerResponse } from "http";
export declare function buildApp(): Promise<{
    fastify: import("fastify").FastifyInstance<import("http").Server<typeof IncomingMessage, typeof ServerResponse>, IncomingMessage, ServerResponse<IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault> & PromiseLike<import("fastify").FastifyInstance<import("http").Server<typeof IncomingMessage, typeof ServerResponse>, IncomingMessage, ServerResponse<IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>> & {
        __linterBrands: "SafePromiseLike";
    };
    httpServer: import("http").Server<typeof IncomingMessage, typeof ServerResponse>;
    io: SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
}>;
//# sourceMappingURL=app.d.ts.map