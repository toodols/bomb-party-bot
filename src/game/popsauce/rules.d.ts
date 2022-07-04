import {List, SelectableRange} from "../util";
import { TagOp } from "./types";

export type Rules = {
	challengeDuration: SelectableRange<5, 30>,
	dictionaryId: List<[
		{
		  "value": "de",
		  "label": "German"
		},
		{
		  "value": "en",
		  "label": "English"
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
		  "value": "hu",
		  "label": "Hungarian"
		}
	  ]>,
	scoreGoal: {
		value: number,
		min: 50,
		step: 10,
		max: 1000,
	},
	scoring: List<[
		{value: "timeBased"},
		{value: "constant"}
	]>,
	shorthands: {value: boolean},
	tagOps: {value: TagOp[]},
	visibleGuesses: {value: boolean}
}