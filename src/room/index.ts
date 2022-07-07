import EventEmitter from "events";
import { io, Socket } from "socket.io-client";
import { BombParty } from "../game/bombparty";
import { Game } from "../game/game";
import { GameSelector } from "../game/gameselector";
import { Player } from "./player";
import { PopSauce } from "../game/popsauce";
import { PlayerId, Profile, PrivateAuth, Language } from "./types";

export * from "./player";

export const games = {
	bombparty: BombParty.BombParty,
	selector: GameSelector,
	popsauce: PopSauce.PopSauce,
}

interface RoomEvents {
	chatterRemoved: (props: {nickname: string})=>void,
	chatterAdded: (props: {nickname: string})=>void,
	chat: (profile: Profile, text: string)=>void,
	playerCountChanged: (props: {count: number})=>void,
	setGame: (game: keyof typeof games)=>void,
}

interface EmitEvents {
	setGame: (game: keyof typeof games)=>void,
	chat: (text: string)=>void,
	getChatterProfiles: (callback: (profiles: Profile[])=>void)=>void

	joinRoom: (props: {
		language: Language,
		nickname: string,
		roomCode: string,
		userToken: string,
		picture?: string,
		auth?: PrivateAuth
	}, callback: (data: {
		roomEntry: {
			roomCode: string,
			isPublic: boolean,
			name: string,
			playerCount: PlayerId,
			gameId: keyof typeof games,
			details?: string,
		},
		selfPeerId: 0,
		selfRoles: []
	})=>void)=>void
}

export class Room extends EventEmitter {
	socket: Socket<RoomEvents, EmitEvents>;
	name: string = "";
	playerCount: number = 0;
	
	/** @private friend(Game) */
	playersCache: Record<PlayerId, Player> = {};

	//@ts-ignore
	game: Game;
	code: string;
	
	userToken: string;

	chat(text: string){
		this.socket.emit("chat", text);
	}

	updatePlayers(profiles: Profile[]){
		for (const profile of profiles) {
			this.playersCache[profile.peerId] = new Player(profile);
		}
	}

	syncPlayers(){
		this.socket.emit("getChatterProfiles", (profiles)=>{
			this.updatePlayers(profiles);
		})
	}

	readyPromise: Promise<void>;

	/**
	 * Gets the player, if it is not found, it will try to fetch the players
	 * @param peerId {id}
	 * @returns 
	 */
	async getPlayer(peerId: PlayerId): Promise<Player | undefined> {
		if (!this.playersCache[peerId]) {
			this.syncPlayers();
		}
		return this.playersCache[peerId];
	}

	selfId: PlayerId = 0;

	constructor(url: string, props: Parameters<EmitEvents["joinRoom"]>["0"]){
		super();
		this.code = props.roomCode;
		this.userToken = props.userToken;

		this.socket = io(url, {reconnection: true, transports: ["websocket"]});

		this.socket.on("playerCountChanged", ({count})=>{
			this.emit("playerCountChanged", count);
			this.playerCount = count;
		})

		this.socket.on("disconnect", (reason)=>{
			console.log("Disconnected from room.", reason);
		})

		this.socket.on("chat", async (profile: Profile, message: string)=>{
			
			const player = await this.getPlayer(profile.peerId);
			if (player) {
				player.syncProfile(profile);
				this.emit("chat", player, message);
			}
		})

		this.readyPromise = new Promise((resolve, reject)=>{
			this.socket.emit("joinRoom", props, async ({roomEntry, selfPeerId, selfRoles})=>{
				this.selfId = selfPeerId;
				this.game = new games[roomEntry.gameId](this, url);
				this.emit("ready");
				resolve();
			})
		})
	}
}

export interface Room {
	on(event: "ready", callback: ()=>void): this;
	on(event: "chat", callback: (author: Player, message: string)=>void): this
}
