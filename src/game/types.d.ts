interface DictionaryManifest {
	bonusAlphabet: "abcdefghijklmnopqrstuvwy";
	name: "English";
	promptDifficulties: { beginner: 500; medium: 300; hard: 100 };
}

interface PlayerState {
	lives: number;
	bonusLetters: string[],
	wasWordValidated: boolean,
	word: string,
}

type Milestone = {
	name: "seating";
	rulesLocked: boolean;
	dictionaryManifest: DictionaryManifest;
	lastRound: {
		winner: { nickname: string };
	};
} | {
	name: "round",
	promptAge: number,
	startTime: number,
	syllable: string,
	currentPlayerPeerId: number,
	usedWords: number,
	playerStatesByPeerId: Record<number, PlayerState>,
	dictionaryManifest: DictionaryManifest,
}