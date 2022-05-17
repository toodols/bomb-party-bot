type SelectableRange<Min extends number,Max extends number> = {
	value: number;
	min: Min;
	max: Max;
}

type NoZeroRange<Min extends number,Max extends number> = SelectableRange<Min,Max> & { disallowZero: true }

type List<Values extends {value: string, label?: string}[]> = {
	values: Values,
	value: Values[number]["value"]
}


interface Rules {
	"dictionaryId": List<[
			{
				"value": "br",
				"label": "Breton"
			},
			{
				"value": "de",
				"label": "German"
			},
			{
				"value": "de-pokemon",
				"label": "Pokemon (German)"
			},
			{
				"value": "en",
				"label": "English"
			},
			{
				"value": "en-pokemon",
				"label": "Pokemon"
			},
			{
				"value": "es",
				"label": "Spanish"
			},
			{
				"value": "fr",
				"label": "French"
			},
			{
				"value": "fr-pokemon",
				"label": "Pokémon (French)"
			},
			{
				"value": "it",
				"label": "Italian"
			},
			{
				"value": "nah",
				"label": "Nahuatl"
			},
			{
				"value": "pt-BR",
				"label": "Brazilian Portuguese"
			}
	]>,
	"minTurnDuration": SelectableRange<1,10>,
	"promptDifficulty": List<[{value: "beginner"}, {value:"medium"}, {value:"hard"}, {value:"custom"}]>,
	"customPromptDifficulty": NoZeroRange<-1000,1000>,
	"maxWordsPerPrompt": SelectableRange<1, 1000>,
	"maxPromptAge": SelectableRange<1,16>,
	"startingLives": SelectableRange<1,5>
	"maxLives": SelectableRange<1,3>
}