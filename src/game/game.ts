import { EventEmitter } from "events";
import { io, Socket } from "socket.io-client";
import { Room } from "../room";
import { BombParty } from "./bombparty";

export class Game extends EventEmitter {
	socket: Socket;
	constructor(public room: Room, url: string) {
		super();
		this.socket = io(url, {reconnection: true, transports: ["websocket"]});
	}
}