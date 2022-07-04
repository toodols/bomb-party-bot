import Searcher from "bomb-party-word-searcher";
import { generateToken, joinRoom } from ".";
import { BombParty } from "./game/bombparty";

const words = `
aww
nyah-nyah-nyahs
uh-oh
nyah-nyahs
`.trim().split("\n");


const searcher = new Searcher();

function findRandomFallbackWord(prompt: string){
	const words = searcher.find(prompt);
	return words[Math.floor(Math.random() * words.length)];
}

function findWord(prompt: string) {
	const found = words.filter(w => w.includes(prompt));
	return found;
}

const works: string[] = [];
const fails: string[] = [];

async function bot(){
	const room = await joinRoom({id: "SZTH", userToken: generateToken()})
	const game = room.game as BombParty;
	game.join();
	game.on("submitResult", (word, success)=>{
		if (words.includes(word)){
			// remove word from words
			words.splice(words.indexOf(word), 1);
			if (success) {
				works.push(word);
			} else {
				fails.push(word);
			}
			console.log(`${words.length} -> ${works.length}, ${fails.length}`);
		}
	})
	game.on("selfTurn", (prompt)=>{
		let currentWordList = findWord(prompt);
		function attempt(){
			let toSubmit = currentWordList.pop();
			if (toSubmit){
				game.submitWord(toSubmit, attempt);
			} else {
				game.submitWord(findRandomFallbackWord(prompt), attempt);
			}
		}
		attempt();
	}) 
}

bot();
bot();

console.log(works, fails);