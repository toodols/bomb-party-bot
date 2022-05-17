import EventEmitter from "events";
import { io, Socket } from "socket.io-client";
import { Game } from "./game";
import { Room } from "../room";
import { Player } from "../room/player";
import { DefaultEventsMap } from "@socket.io/component-emitter";


export class GamePlayer extends EventEmitter {
	word: string = "";
	bonusLetters: string[] = [];
	wordHistory: string[] = [];
	isDead: boolean = false;
	lives: number = 0;

	syncPlayerState(state: PlayerState){
		this.word = state.word;
		this.bonusLetters = state.bonusLetters;
		this.lives = state.lives;
	}

	constructor(public player: Player) {
		super();
	}
}

export class BombParty extends Game {
	players: Record<PlayerId, GamePlayer> = {};

	submitWord(text: string) {
		this.socket.emit("setWord", text, true);
	}

	setWord(text: string) {
		this.socket.emit("setWord", text, false);
	}

	turn?: PlayerId;
	currentPrompt?: string;
	wordHistory: string[] = [];
	readyPromise: Promise<void>;

	join() {
		this.socket.emit("joinRound");
	}
	constructor(public room: Room, url: string) {
		super(room, url);
		this.socket.emit("joinGame", "bombparty", room.code, room.userToken);
		this.socket.on("disconnect", ()=>{
			// @todo
		})

		this.socket.on("nextTurn", (id, prompt, promptAge)=>{
			this.turn = id;
			this.currentPrompt = prompt;
			this.emit("nextTurn");
			if (id === this.room.selfId) {
				this.emit("selfTurn", prompt);
			}
		})

		this.socket.on("addPlayer", async ({profile})=>{
			this.room.updatePlayers([profile]);
			this.players[profile.peerId] = new GamePlayer((await this.room.getPlayer(profile.peerId))!);
		})

		this.socket.on("setPlayerWord", (playerid, word)=>{
			this.players[playerid].word = word;
		})

		this.socket.on("livesLost", (playerId, lives)=>{
			this.players[playerId].lives = lives;
		})

		this.socket.on("setMilestone", (milestone)=>{
			if (milestone.name === "seating") {
				this.emit("gameEnded");
			} else if (milestone.name === "round") {
				this.currentPrompt = milestone.syllable;
				if (milestone.currentPlayerPeerId === this.room.selfId) {
					this.emit("selfTurn", milestone.syllable);
				}
			}
		})

		this.socket.on("failWord", (playerId, reason)=>{
			if (playerId === this.room.selfId) {
				const player = this.players[playerId];
				this.emit("selfFail", player.word, reason);
			}
		})

		this.socket.on("correctWord", ({playerPeerId: playerId, bonusLetters})=>{
			const player = this.players[playerId];
			player.bonusLetters = bonusLetters;
			player.wordHistory.push(player.word);
			this.wordHistory.push(player.word);
			this.emit("wordUsed", player);
		})
		
		this.socket.on("disconnect", (reason)=>{
			console.log("Bomb party disconnected " + reason)
		})

		this.readyPromise = new Promise((resolve, reject)=>{
			this.socket.on("setup", async (data) => {
				const players = data.players.map(e=>e.profile);
				room.updatePlayers(players);
				for (const p of players) {
					this.players[p.peerId] = new GamePlayer((await this.room.getPlayer(p.peerId))!);
				}
				resolve();
			});
		})
	}
}

export interface BombParty {
	on(event: "nextTurn", callback: ()=>void): this
	on(event: "selfTurn", callback: (prompt: string)=>void): this
	on(event: "gameEnded", callback: ()=>void): this
	on(event: "selfFail", callback: (word: string, reason: "notInDictionary" | "mustContainSyllable" | "alreadyUsed")=>void): this
	socket: Socket<
		{
			livesLost: (id: PlayerId, lives: number)=>void,
			failWord: (id: PlayerId, reason: "notInDictionary" | "mustContainSyllable" | "alreadyUsed")=>void,
			updatePlayer: (id: PlayerId, profile: Profile, isOnline: boolean)=>void,
			setPlayerWord: (playerId: PlayerId, word: string) => void;
			correctWord: (props: {playerPeerId: PlayerId, bonusLetters: string[]}) => void;
			nextTurn: (playerId: PlayerId, prompt: string, promptAge: number) => void;
			setStartTime: (startTime: number, serverNow: number) => void;
			addPlayer: (data: { isOnline: boolean; profile: Profile }) => void;
			removePlayer: (id: PlayerId) => void;
			setMilestone: (data: Milestone, time: number)=>void;
			setup: (data: {
				serverNow: number;
				selfPeerId: PlayerId;
				rules: Rules;
				leaderPeerId: PlayerId;
				players: ProfileWithOnline[];
				milestone: Milestone;
				constants: {
					maxBombDuration: 30;
					maxPlayers: 16;
					maxWordLength: 30;
					minBombDuration: 10;
					minPlayers: 2;
					startTimerDuration: 15;
					submitRateLimit: { interval: 300; max: 5 };
				};
			}) => void;
		},
		{
			joinRound: () => void;
			joinGame: (gameId: "bombparty", code: string, token: string) => void;
			setWord: (word: string, submit?: boolean) => void;
		}
	>;
}
