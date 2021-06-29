import { Server, Socket } from 'socket.io';

/* eslint-disable prettier/prettier */
export abstract class GatewayService {
    protected socket: Server;

    protected wsClients: Map<Socket, string> = new Map<Socket, string>();

    //#region Socket

    setSocket(socket: Server) {
        this.socket = socket;
    }

    getSocket(): Server {
        return this.socket;
    }

    //#endregion

    //#region Connected clients

    addConnectedClient(licenseId: string, client: Socket) {
        this.wsClients.set(client, licenseId);
    }

    getConnectedClient(licenseId: string, strict = false): Socket[] {
        const found: Socket[] = [];

        for (const [key, value] of this.wsClients) {
            if (value === licenseId) {
                found.push(key);
            }
        }

        if (!found.length && strict) {
            throw new Error(`Client for license ${licenseId} not found`);
        }

        return found;
    }

    removeConnectedClient(clientId: string) {
        for (const [key, value] of this.wsClients) {
            if (key.id === clientId) {
                this.wsClients.delete(key);
            }
        }
    }

    getConnectedClients(): Map<Socket, string> {
        return this.wsClients;
    }

    //#endregion
}
