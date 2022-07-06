import { Socket } from "socket.io-client";
import { Room } from "../room";
import { PlayerId } from "../room/types";
import { Game } from "./game";

export class GameSelector extends Game {
	constructor(room: Room, url: string){
		super(room, url);
	}
}

export interface GameSelector {
	socket: Socket<{
		updateGameVotes: (votes: {
			bombparty: PlayerId[],
			popsauce: PlayerId[]
		})=>void;
	},{
		setVote: (game: "bombparty" | "popsauce") => void;
	}>;
}