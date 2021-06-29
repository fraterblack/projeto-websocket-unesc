import { Module } from '@nestjs/common';

import { OuterGatewayService } from './outer-gateway.service';
import { OuterGatewayWebsocket } from './outer-gateway.websocket';

/* eslint-disable prettier/prettier */
@Module({
    imports: [],
    controllers: [],
    providers: [
        OuterGatewayWebsocket,
        OuterGatewayService,
    ],
})
export class WebsocketModule { }
