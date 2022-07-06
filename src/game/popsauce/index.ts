import { Game } from "../game";
import { Player } from "../../room/player";
import { Room } from "../../room";
import EventEmitter from "events";
import { Socket } from "socket.io-client";
import { PlayerState, Challenge, ChallengeResult, Milestone, GameEndMilestone, TagOp } from "./types";
import { Rules } from "./rules";
import { PlayerId, Profile, ProfileWithOnline } from "../../room/types";

export namespace PopSauce {
	export class GamePlayer extends EventEmitter {
		points: number = 0;
		guess: string = "";
		hasFoundSource: boolean = false;

		syncPlayerState(state: PlayerState) {
			this.points = state.points;
			this.guess = state.guess;
			this.hasFoundSource = state.hasFoundSource;
		}

		constructor(public player: Player) {
			super();
		}
	}

	export enum State {
		Challenge,
		ChallengeEnd,
		GameEnd,
		Unknown,
	}

	type SetRules = Partial<{ [K in keyof Omit<Rules, "tagOps">]: Rules[K]["value"] }>;
	export class PopSauce extends Game {
		players: Record<number, GamePlayer> = {};
		leader?: Player;
		//@ts-ignore
		dictionaryId: string;
		//@ts-ignore
		rules: Required<SetRules>;
		imageUrl: string = "";
		readyPromise: Promise<void>;
		challenge: Challenge | null = null;
		challengeResult: ChallengeResult | null = null;
		state: State = State.Unknown;
		tagOps: TagOp[] = [];

		/** setRulesLocked needs to be set to false in order for rule changes to work */
		setRulesLocked(val: boolean) {
			this.socket.emit("setRulesLocked", val);
		}
		submitGuess(text: string, failed?: (reason: string) => void) {
			this.socket.emit("submitGuess", text);
		}
		setRules(rules: SetRules) {
			this.socket.emit("setRules", rules);
		}
		setTagOps(tags: TagOp[]) {
			this.socket.emit("setTagOps", tags);
		}
		join() {
			this.socket.emit("joinRound");
		}
		constructor(public room: Room, url: string) {
			super(room, url);
			this.socket.emit("joinGame", "popsauce", room.code, room.userToken);
			this.socket.on("startChallenge", (challenge, serverNow) => {
				this.state = State.Challenge;
				this.challenge = challenge;
				this.emit("challenge", challenge);
			});
			this.socket.on("endChallenge", (challengeResult: ChallengeResult) => {
				this.state = State.ChallengeEnd;
				this.challengeResult = challengeResult;
				this.emit("challengeEnded", challengeResult);
			});
			this.socket.on("addPlayer", async ({ profile }) => {
				this.room.updatePlayers([profile]);
				this.players[profile.peerId] = new GamePlayer((await this.room.getPlayer(profile.peerId))!);
			});
			this.socket.on("setMilestone", (milestone, serverEnd) => {
				this.state = State.GameEnd;
				this.emit("gameEnded");
				for (const pid in this.players) {
					this.players[pid].guess = "";
					this.players[pid].hasFoundSource = false;
					this.players[pid].points = 0;
				}
			});
			this.socket.on("setPlayerState", (playerId, guess: PlayerState) => {
				this.players[playerId]?.syncPlayerState(guess);
				if (playerId === this.room.selfId) {
					let gamePlayer = this.players[playerId];
					if (!gamePlayer.hasFoundSource) {
						if (guess.hasFoundSource) {
							// this.emit("selfCorrect")
						} else {
							this.emit("selfFail", guess.guess);
						}
					}
				}
			});
			this.socket.on("setDictionary", (dictionary) => {
				this.dictionaryId = dictionary.dictionaryId;
			});

			this.socket.on("disconnect", (reason) => {
				console.log("Pop sauce disconnected", reason);
			});

			this.readyPromise = new Promise((resolve, reject) => {
				this.socket.on("setup", (data) => {
					if ("lastRound" in data.milestone) {
						// do something here
					} else {
						this.challenge = data.milestone.challenge;
						this.challengeResult = data.milestone.challengeResult;
					}
					this.rules = {
						challengeDuration: data.rules.challengeDuration.value,
						dictionaryId: data.rules.dictionaryId.value,
						scoreGoal: data.rules.scoreGoal.value,
						scoring: data.rules.scoring.value,
						shorthands: data.rules.shorthands.value,
						visibleGuesses: data.rules.visibleGuesses.value,
					};
					this.tagOps = data.rules.tagOps.value;

					this.room.updatePlayers(data.players.map((p) => p.profile));
					this.room.getPlayer(data.leaderPeerId).then((leader) => {
						this.leader = leader;
						resolve();
					});
				});
			});
		}
	}

	export interface PopSauce {
		on(event: "challenge", callback: (challenge: Challenge) => void): this;
		on(event: "challengeEnded", callback: (result: ChallengeResult) => void): this;
		on(event: "gameEnded", callback: () => void): this;
		on(event: "selfFail", callback: (guess: string) => void): this;
		socket: Socket<
			{
				startChallenge: (challenge: Challenge, serverNow: number) => void;
				endChallenge: (challengeResult: ChallengeResult) => void;
				addPlayer: (data: { isOnline: boolean; profile: Profile }) => void;
				setPlayerState: (player: PlayerId, state: PlayerState) => void;
				setMilestone: (milestone: GameEndMilestone, serverEnd: number) => void;
				setDictionary: (dictionary: {
					dictionaryId: Rules["dictionaryId"]["value"];
					filteredQuoteCount: number;
					totalQuoteCount: number;
					tagOps: TagOp[];
				}) => void;
				setup: (data: {
					serverNow: number;
					selfPeerId: PlayerId;
					rules: Rules;
					leaderPeerId: PlayerId;
					players: ProfileWithOnline[];
					milestone: Milestone;
					constants: {
						challengeResultDuration: 5;
						maxPlayers: 100;
						maxSourceLength: 50;
						minPlayers: 2;
						startTimerDuration: 15;
						submitRateLimit: { interval: 300; max: 5 };
					};
				}) => void;
			},
			{
				joinRound: () => void;
				joinGame: (gameId: "popsauce", code: string, token: string) => void;
				submitGuess: (guess: string) => void;
				setRules: (rules: SetRules) => void;
				setTagOps: (ops: TagOp[]) => void;
				setRulesLocked: (val: boolean) => void;
			}
		>;
	}
}
