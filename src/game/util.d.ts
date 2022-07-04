export type SelectableRange<Min extends number,Max extends number> = {
	value: number;
	min: Min;
	max: Max;
}

export type NoZeroRange<Min extends number,Max extends number> = SelectableRange<Min,Max> & { disallowZero: true }

export type List<Values extends {value: string, label?: string}[]> = {
	values: Values,
	value: Values[number]["value"]
}