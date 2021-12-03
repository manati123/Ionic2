import WebSocket from "ws";
import jwt from "jsonwebtoken";
import { jwtConfig } from "./constants";

let webSocketServer;

export const initWebSocketServer = value => {
    webSocketServer = value;

    webSocketServer.on('connection',webSocket => {
        webSocket.on('message',message => {
            const{type,payload: {token}} = JSON.parse(message);
            if(type !== 'authorization'){
                webSocket.close();
                return;
            }

            try{
                webSocket.user = jwt.verify(token,jwtConfig.secret);
            }catch(error){
                webSocket.close();
            }
        });
    });
};