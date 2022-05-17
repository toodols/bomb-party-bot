import {io} from "socket.io-client";
import {EventEmitter} from "events";
import { Room } from "./room";
import { webcrypto } from 'crypto'
import { BombParty } from "./game/bombparty";
import Searcher from "bomb-party-word-searcher";
import { Player } from "./room/player";
import {fetch} from "cross-fetch";

const crypto = webcrypto as unknown as Crypto

export async function joinRoom(props: {id: string, nickname?: string, userToken: string}){
	const url: string = await fetch("https://jklm.fun/api/joinRoom", {
		headers: { "content-type": "application/json" },
		body: JSON.stringify({roomCode: props.id}),
		method: "POST"
	}).then(res => res.json()).then(e=>e.url);

	const r = new Room(url, {
		language: "en-US",
		nickname: props.nickname || "Guest",
		roomCode: props.id,
		userToken: props.userToken,
	});
	await r.readyPromise;
	return r;
}

// token generation is done on the client
export function generateToken(){
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	let token = "";
	const digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";
	for (let i = 0; i < array.length; i++) token += digits[array[i] % digits.length];
	return token;
}


const searcher = new Searcher();
const phobia = searcher.find("phobia");
function findPhobia(prompt: string, wordHistory: string[]){
	for (const word of phobia){
		if (word.toLowerCase().includes(prompt) && !wordHistory.includes(word)) {
			return word;
		}
	}
}

for (let i = 0; i< 6; i++) {
	const r = await joinRoom({id: "RCRV", nickname: "eek " + i, userToken: generateToken()});
	r.on("chat", (player, message)=>{
		if (message === "hello") {
			r.chat(`${player.nickname}, please shut up no one cares lmao.`);
		} else if (message === "go away eek") {
			
		}
	})
	if (r.game instanceof BombParty) {
		const game = r.game;
		game.on("gameEnded", ()=>{
			game.join();
		})
		game.join();
		game.on("selfFail", ()=>{
			console.log("failed");
		})
		game.on("selfTurn", (prompt)=>{
			const phobia = findPhobia(prompt, game.wordHistory);
			console.log(game.wordHistory);
			if (phobia) {
				return game.submitWord(phobia);
			}
			const words = searcher.find(prompt)
			let time = Date.now();
			let interval = setInterval(()=>{
				const random = words[Math.floor(Math.random()*words.length)];
				if (Date.now() - time > 1000) {
					game.submitWord(random);
					clearInterval(interval);
				} else {
					game.setWord(random); 
				}
			}, 100);
		})
	}
}

// for (let i = 1; i< 6; i++) {
// 	const r = await joinRoom({id: "EEQH", nickname: "Sieste " + i, userToken: generateToken()});
// 	r.on("chat", (player, text)=>{
// 		if (text === "hello") {
// 			r.chat(player.nickname + ", please shut up nobody cares");
// 		}
// 	})
// 	if (r.game instanceof BombParty) {
// 		r.game.join();
// 		r.game.on("gameEnded", ()=>{
// 			(r.game as BombParty).join();
// 		})
// 		r.game.on("selfTurn", (prompt)=>{
// 			const words = searcher.find(prompt)
// 			const random = words[Math.floor(Math.random()*words.length)];
// 			(r.game as BombParty).submitWord(random);
// 		})
// 	}
// }