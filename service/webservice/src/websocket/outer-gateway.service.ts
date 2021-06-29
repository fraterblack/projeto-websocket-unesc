import { Injectable, Logger } from '@nestjs/common';

import { GatewayService } from './gateway-service';

/* eslint-disable prettier/prettier */
@Injectable()
export class OuterGatewayService extends GatewayService {
    private logger = new Logger(OuterGatewayService.name);

    async sendCommand(command: any): Promise<any> {
        const clients = this.getConnectedClient(command.licenseId);

        for (const client of clients) {
            try {
                this.socket.to(client.id).emit('command', command);

            } catch (error) {
                this.logger.error(`Error on send command to client ${client.id} - ${command.licenseId}`, error?.stack);
            }
        }

        return command;
    }
}
