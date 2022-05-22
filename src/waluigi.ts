import Searcher from "bomb-party-word-searcher";
import { stdin } from "process";
import { generateToken, joinRoom } from ".";
import { BombParty } from "./game/bombparty";


const searcher = new Searcher();

export async function waluigi(roomid: string, token = generateToken()){
	const room = await joinRoom({ id: roomid, nickname: "Waluigi", userToken: token });
	console.log(room);
	let die = false;
	room.on("chat", (player, message) => {
		if (message === "waluigi") {
			room.chat("wah!!~");
		} else if (message === "waluigi help me pls") {
			if (room.game instanceof BombParty && room.game.currentPrompt) {
				const w = searcher.find(room.game.currentPrompt);
				w.sort((a, b) => a.length - b.length);
				room.chat(w[Math.floor(Math.random() * w.length)]);
			}
		} else if (message === "waluigi go kill yourself") {
			die = true;
		} else if (message === "waluigi don't kill yourself your life matters") {
			die = false
		}
	});

	function findFancyWord(prompt: string, wordList: string[]){
		let words = searcher.find(prompt);
		// sort prompts by descending length
		words.sort((a, b) => a.length - b.length);
		for (const word of words) {
			if (!wordList.includes(word)) return word;
		}
	}

	subBombParty();

	function subBombParty(){
		console.log(room.game);
		if (room.game instanceof BombParty) {
			const game = room.game;
			game.on("gameEnded", () => {
				die = false;
				game.join();
			});
			game.join();
			game.on("selfFail", () => {
				const words = searcher.find(game.currentPrompt!);
				game.submitWord(words[Math.floor(Math.random() * words.length)]);
			});
			game.on("selfTurn", async (prompt) => {
				if (die) return game.submitWord("💥");
				const word = findFancyWord(prompt, game.wordHistory)!;
				console.log(word);
				let i = 0;
				let interval = setInterval(()=>{
					i++;
					if (i === word.length) {
						game.submitWord(word);
						clearInterval(interval);
					} else {
						game.setWord(word.substring(0, i));
					}
				}, 50)

				// let time = Date.now();
				// let interval = setInterval(()=>{
				// 	const random = words[Math.floor(Math.random()*words.length)];
				// 	if (Date.now() - time > 1000) {
				// 		game.submitWord(random);
				// 		clearInterval(interval);
				// 	} else {
				// 		game.setWord(random); 
				// 	}
				// }, 100);
			});
		}
	}

	return (message: string)=>{
		room.chat(message);
	}
}

const msg = waluigi("JVSH", "+h9C6lhvyQ5hvOaj")