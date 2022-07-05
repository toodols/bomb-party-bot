import { createRoom, generateToken, joinRoom } from "../index";
import {PopSauce} from "../game/popsauce";
import {createHash} from "crypto";
import { appendFile, existsSync, readFile, readFileSync, writeFileSync } from "fs";

const answers: Record<string, string> = {};

if (!existsSync("popsauce-answers")) {
	writeFileSync("popsauce-answers", "");
}
let file = readFileSync("popsauce-answers").toString();
for (const line of file.trim().split("\n")) {
	let match = line.match(/([0-9a-f]+) (.+)/)
	if (!match) {console.log("Error: "+line); continue}
	let hash = match[1];
	let answer = match[2];
	if (answers[hash]) {
		console.log("DUPLICATE DETECTED:", hash)
	}
	answers[hash] = answer;
};

var picture = `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`

async function popbot(id: string, userToken: string = generateToken(), master=false){
	let room = await joinRoom({id, nickname: master?"PopBot (Master)":"PopBot", userToken, picture})
	let answer = "";
	room.on("chat", (player, message)=>{
		if (message === "answer") {
			if (room.game instanceof PopSauce) {
				room.chat(`Guess: ${answer}`)
			}
		}
	})
	if (room.game instanceof PopSauce) {
		let game = room.game;
		await game.readyPromise;
		if (master) {
			game.setRulesLocked(false);
			game.setRules({
				challengeDuration: 5
			})
			game.setTagOps([]);
			game.setRulesLocked(true);
		}
		let currentHash: string = "";
		let i: NodeJS.Timer | null = null;
		game.on("challenge", (challenge)=>{
			if (challenge.text) {
				currentHash = createHash("sha256").update(challenge.prompt).update(challenge.text).digest("hex").toString();
			} else if (challenge.image) {
				currentHash = createHash("sha256").update(challenge.prompt).update(new Uint8Array(challenge.image.data)).digest("hex").toString();
			}
			if (answers[currentHash]) {
				answer = answers[currentHash];
				// let a = answer.split("").map(e=>"_");
				// let index = 0;
				// i = setInterval(()=>{
				// 	a = answer.split("").map(e=>"_");
				// 	console.log(index, answer[index]);
				// 	a[index] = answer[index];
				// 	game.submitGuess(a.join(""));
				// 	index++;
				// 	if (index === answer.length) {
				// 		index = 0;
				// 	}
				// }, 500)
				game.submitGuess(answers[currentHash]);
			}
		})
		game.on("challengeEnded", (result)=>{
			if (i){
				clearInterval(i);
			}
			if (!answers[currentHash]) {
				console.log(currentHash, result.source);
				room.chat(`Added This challenge (${result.source}) to list of answers!.`)
				appendFile("popsauce-answers", `${currentHash} ${result.source}\n`, ()=>{})
				answers[currentHash] = result.source;
			}
		})
		game.on("gameEnded", () => {
			game.join();
		});

		game.join();
	}
}

async function createBotRooms(){
	for (let i = 0; i<0; i++) {
		let token = generateToken();
		console.log(`Creating room with token: ${token}`)
		let res = await createRoom({
			name: `PopBot Data Collection #${i}`,
			gameId: "popsauce", 
			isPublic: false,
			creatorUserToken: token,
		})
		if (!res) {throw new Error("wtf")}; 
		console.log(`Room created: https://jklm.fun/${res.roomCode}`);
		popbot(res.roomCode, token, true);
		popbot(res.roomCode, generateToken());
	}	
	let token = generateToken();
	popbot("QVZG", token);
}

createBotRooms();