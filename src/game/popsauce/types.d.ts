export type Challenge = {
	endTime: number;
	prompt: string,
} & ({
	image: {
		data: ArrayBuffer,
		type: "image/jpeg",
	},
	text: null,
} | {
	image: null,
	text: string,
})

export interface ChallengeResult {
	details: string;
	fastest: null |string;
	findSourcesByPlayerId: Record<number, string>;
	source: string;
	submitter: string;
}

export interface PlayerState {
	guess: string;
    hasFoundSource: boolean;
    points: number;
}

export type TagOp = {op: "union" | "intersection" | "difference", tag: Tag}

export type Tag = 
	"Mainstream" |
	"Easy" |
	"Medium" |
	"Hard" |
	"1960s" |
	"1970s" |
	"1980s" |
	"1990s" |
	"Animated movies" |
	"Anime & Manga" |
	"Architecture" |
	"Art" |
	"Brands" |
	"Capital cities" |
	"Cartoons" |
	"Comic books" |
	"Countries" |
	"Flags" |
	"French" |
	"Game of Thrones" |
	"Geography" |
	"Indie games" |
	"Internet & Memes" |
	"K-pop" |
	"Literature" |
	"Logos" |
	"Movies" |
	"Music" |
	"Nature" |
	"Personalities" |
	"Pokémon" |
	"Rap" |
	"Series" |
	"Software & Apps" |
	"Sport" |
	"Superheroes" |
	"TV Shows" |
	"Technology" |
	"The Witcher" |
	"Video games" |
	"Videos & Streams"

export type Milestone = GameEndMilestone | {
	playerStatesByPeerId: Record<number, PlayerState>,
	// challenge will be set to null when the challenge ends
	challenge: Challenge | null,
	// challengeResult will not be set to null when another challenge starts
	challengeResult: ChallengeResult | null,
}

export type GameEndMilestone = {
	lastRound: {
		winner: {nickname: string}
	},
	name: "seating",
	rulesLocked: boolean,
	startTime: null;
}