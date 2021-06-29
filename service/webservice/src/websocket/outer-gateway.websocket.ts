import { Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { OuterGatewayService } from './outer-gateway.service';

/* eslint-disable prettier/prettier */
@WebSocketGateway(4010)
export class OuterGatewayWebsocket
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private logger = new Logger(OuterGatewayWebsocket.name);

    @WebSocketServer()
    server: Server;

    constructor(
        private outerGatewayService: OuterGatewayService,
    ) { }

    @SubscribeMessage('connected')
    async onConnected(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        try {
            this.outerGatewayService.addConnectedClient(
                data.licenseId,
                client,
            );
        } catch (error) {
            this.error(error);

            return { success: false, reason: error };
        }

        return { success: true };
    }

    @SubscribeMessage('check-pong')
    async onCheckPong(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        this.log('<-- Pong received from: ' + client.id);

        return { success: true };
    }

    @SubscribeMessage('command')
    async onSendCommand(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        this.log(
            '--> Command received from browser: ' +
            client.id +
            ' - ' +
            JSON.stringify(data),
        );

        try {
            // Send command to client
            this.outerGatewayService.sendCommand(data);

        } catch (error) {
            this.error(error);
            return { success: false, reason: error };
        }

        return { success: true };
    }

    @SubscribeMessage('command-finished')
    async onCommandFinished(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        this.log(
            '<-- Command finished: ' +
            client.id +
            ' - ' +
            JSON.stringify(data),
        );

        try {
            // Since origin is setted, notify origin
            if (data && data.origin) {
                this.outerGatewayService
                    .getSocket()
                    .to(data.origin).emit('command-finished', data);
            }
        } catch (error) {
            this.error(error);
            return { success: false, reason: error };
        }

        return { success: true };
    }

    @SubscribeMessage('registered-records')
    async onRegisteredRecordsReceive(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        this.log(
            '<-- Registered records received: ' +
            client.id +
            ' - ' +
            JSON.stringify(data),
        );

        try {
        } catch (error) {
            this.error(error);
            return { success: false, reason: error };
        }

        return { success: true };
    }

    afterInit(server: Server) {
        this.log('Gateway initialized');

        // Update socket server into Gateway service
        this.outerGatewayService.setSocket(server);

        // Fires ping to all connected clients
        this.ping();

        setTimeout(() => {
            this.ping();
        }, 10000);
    }

    handleDisconnect(client: Socket) {
        this.log(`(x) Client disconnected: ${client.id}`);

        this.outerGatewayService.removeConnectedClient(client.id);
    }

    handleConnection(client: Socket) {
        this.log(`(!) Client connected: ${client.id}`);
    }

    private ping() {
        this.log('Ping emitted');

        this.server.emit('check-ping', {
            date: new Date(),
        });

        setTimeout(() => {
            this.ping();
        }, 300000);
    }

    private error(message: string) {
        this.logger.error(`[Outer WS]: ${message}`);
    }

    private log(message: string) {
        this.logger.warn(`[Outer WS]: ${message}`);
    }
}
