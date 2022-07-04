import Searcher from "bomb-party-word-searcher";
import { appendFile, appendFileSync, mkdirSync } from "fs";
import { generateToken, joinRoom } from "..";
import { BombParty } from "../game/bombparty";
import imagetobase64 from "image-to-base64";

const searcher = new Searcher();
let blacklist: string[] = [];

function findFancyWord(prompt: string, blacklist: string[]) {
	let words = searcher.find(prompt);
	// sort prompts by descending length
	words.sort((a, b) => b.length - a.length);
	// const hyphens =  words.filter(word => word.includes("-"));
	let random: string;
	for (const word of words) {
		if (!blacklist.includes(word)) {
			return word;
		}
	}
	// while (random = words[Math.floor(Math.random() * words.length)]) {
	// 	if (!blacklist.includes(random)) {
	// 		return random;
	// 	}
	// };
}
const picture = `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`;

function normalize(word: string){
	return word.toLowerCase().split("").filter(e=>e.match(/[a-z]/))
}

export async function waluigi(roomid: string, token = generateToken(), master=false) {
	let scores:Record<number, number[]> = {};

	const file = new Date().toUTCString();
	function log(message: string){
		if (master) {
			appendFileSync(
				`logs/${file}.log`,
			`[${Date.now()}] ${message}\n`
			);
		}
	}
	log(`${roomid} ${token} Waluigi started`);
	const room = await joinRoom({ id: roomid, nickname: "Waluigi", userToken: token, picture });
	let die = false;
	let life = false;
	room.on("chat", (player, message) => {
		log(`CHAT ${player.nickname}(${player.id}): ${message}`);
		if (message === "waluigi") {
			room.chat("wah!!~");
		} else if (message === "waluigi help me pls") {
			if (room.game instanceof BombParty && room.game.currentPrompt) {
				const w = searcher.find(room.game.currentPrompt);
				w.sort((a, b) => b.length - a.length);
				room.chat(w[Math.floor(Math.random() * w.length)]);
			}
		} else if (message.match(/waluigi give me a ([a-z]+)/)) {
			let v = message.match(/waluigi give me a ([a-z]+)/);
			if (v && room.game instanceof BombParty && room.game.currentPrompt) {
				let a = v;
				const w = searcher.find(room.game.currentPrompt).filter((e) => e.match(a[1]));
				room.chat(w[Math.floor(Math.random() * w.length)]);
			}
		} else if (message === "waluigi go get a life") {
			life = true;
		} else if (message === "waluigi you got enough lives") {
			life = false;
		} else if (message === "waluigi go kill yourself") {
			die = true;
		} else if (message === "waluigi don't kill yourself your life matters") {
			die = false;
		} else if (message === "waluigi what is my score"){
			if (scores[player.id]) {
				let sc = Math.floor(scores[player.id].reduce((acc, cur)=>{return acc+cur}, 0)/scores[player.id].length*100)/100
				room.chat(`Your score: ${sc}`);
			} else {
				room.chat("You don't have a score")	
			}
		} else if (message.match(/waluigi score of [0-9]+/)) {
			let id = parseInt(message.match(/waluigi score of ([0-9]+)/)![1]);
			if (scores[id]) {
				async function block(){
					let sc = Math.floor(scores[id].reduce((acc, cur)=>{return acc+cur}, 0)/scores[id].length*100)/100
					let p = await room.getPlayer(id);
					room.chat(`Score of ${p?.nickname}: ${sc}`);
				}
				block();
			} else {
				room.chat("Player doesn't have a score")	
			}
		} else if (message === "waluigi leaderboard") {
			function toScore(scs: number[]){
				return scs.reduce((acc, cur)=>{return acc+cur}, 0)/scs.length
			}
			let sorted = Object.entries(scores).sort((a,b)=>toScore(b[1])-toScore(a[1])).slice(0, 5);
			Promise.all(sorted.map((e)=>room.getPlayer(parseInt(e[0])))).then(players=>{
				room.chat(`Leaderboard: ${players.map((e, i)=>`${i+1}. ${e?.nickname}: ${Math.floor(toScore(sorted[i][1])*100)/100}`).join(", ")}`);
			});
		}
	});

	subBombParty();

	function subBombParty() {
		if (room.game instanceof BombParty) {
			const game = room.game;
			game.on("gameEnded", () => {
				die = false;
				setTimeout(()=>{
					game.join();
				}, 1000)
				searcher.reset_excluded();
				log(`GAME ENDED`);
			});
			game.on("wordUsed", (player, word, raw) => {
				if (master) {
					if (!scores[player.player.id]) {
						scores[player.player.id] = []
					}
					scores[player.player.id].push(word.match(/\-/)?word.length*1.5:word.length);
					log(`WORD USED ${player.player.nickname}(${player.player.id}): ${word}`);
				}
				if (searcher.find(word).length === 0) {
					searcher.add(word);
					console.log("added", word);
					appendFile("add", word + "\n", () => {});
				}
				searcher.add_to_excluded(word);
			});
			game.join();
			game.on("selfFail", (word, reason) => {
				log(`FAILED ${word}: ${reason}`);
				if (reason === "notInDictionary") {
					blacklist.push(word);
					appendFile("remove", word + "\n", () => {});
					game.submitWord("💥");
				} else if (reason === "alreadyUsed"){
					setTimeout(()=>{
						const word = findFancyWord(game.currentPrompt!, blacklist)!;
						game.submitWord(word);
					}, 500)
				}
			});
			game.on("selfTurn", async (prompt) => {
				if (die) {
					setTimeout(() => {
						game.submitWord("💥");
					}, 500);
					return;
				}
				// const words = searcher.find(prompt);
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

				let word = findFancyWord(prompt, blacklist);
				if (!word) {
					log(`EXHAUSTED ${prompt}	`)
					searcher.reset_exhausted(prompt);
					word = findFancyWord(prompt, blacklist);
				}
				if (word) {
					game.submitWord(word);
					// setTimeout(() => {
					// 	// game.submitWord(word!, (reason) => {
					// 	// 	if (reason === "notInDictionary") {
					// 	// 		appendFile("./unknown", `${word}\n`, () => {});
					// 	// 	}
					// 	// });
					// 	let i = 0;
					// 	let interval = setInterval(()=>{
					// 		i++;
					// 		if (i === word!.length) {
					// 			clearInterval(interval);
					// 			game.submitWord(word!, (reason)=>{
					// 				console.log("FAILED: ", word)
					// 				blacklist.push(word!);
					// 				if (reason === "notInDictionary") {
					// 					appendFile("./unknown", `${word}\n`, ()=>{})
					// 				}
					// 			});
					// 		} else {
					// 			game.setWord(word!.substring(0, i));
					// 		}
					// 	}, 100)
					// }, 1500);
				} else {
					// let word = searcher.find(prompt);
					// game.submitWord(word[Math.floor(Math.random() * word.length)]);
					// console.log(prompt);
					game.submitWord("💥");
					appendFile("unknown", prompt + "\n", () => {});
				}
			});
		}
	}

	return (message: string) => {
		room.chat(message);
	};
}

console.log(waluigi("UJKT", "+h9C6lhvyQ5hvOaj", true));
// console.log(waluigi("AHPE", "+h9C6lhvyQ5hvOae"))
// console.log(waluigi("AHPE", "+h9C6lhvyQ5hvOad"))
// console.log(waluigi("QJUC", "+h9C6lhvyQ5hvOaf"))
// console.log(waluigi("AHPE", "+h9C6lhvyQ5hvOag"))
// console.log(waluigi("AHPE", "+h9C6lhvyQ5hvOah"))
// console.log(waluigi("AHPE", "+h9C6lhvyQ5hvOak"))
// console.log(waluigi("AHPE", "+h9C6lhvyQ5hvOee"))
