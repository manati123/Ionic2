import WebSocket from "ws";
import jwt from "jsonwebtoken"
import {jwtConfig} from "./constants.js";

let webSocketServer;

export const initWebSocketServer = value => {
    webSocketServer = value;

    webSocketServer.on('connection', webSocket => {
        webSocket.on('message', message => {

            const { type, payload: { token } } = JSON.parse(message);
            if(type !== 'authorization') {
                webSocket.close();
                return;
            }

            try {
                webSocket.user = jwt.verify(token,jwtConfig.secret);
            } catch(error) {
                webSocket.close();
            }
        })
    });
};

export const broadcast = (userId, data) => {
    if(!webSocketServer) {
        return;
    }

    webSocketServer.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN && userId === client.user._id) {
            console.log(`broadcast sent to ${client.user.username}`);
            client.send(JSON.stringify(data));
        }
    });
};
