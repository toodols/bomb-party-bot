import { createRoom, generateToken, joinRoom } from "./index";
import {PopSauce} from "./game/popsauce";
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

async function popbot(id: string, userToken: string = generateToken(), master=false){
	let room = await joinRoom({id, nickname: master?"PopBot (Master)":"PopBot", userToken})
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
		game.on("challenge", (challenge)=>{
			if (challenge.text) {
				currentHash = createHash("sha256").update(challenge.prompt).update(challenge.text).digest("hex").toString();
			} else if (challenge.image) {
				currentHash = createHash("sha256").update(challenge.prompt).update(new Uint8Array(challenge.image.data)).digest("hex").toString();
			}
			if (answers[currentHash]) {
				game.submitGuess(answers[currentHash]);
			}
		})
		game.on("challengeEnded", (result)=>{
			if (!answers[currentHash] && master) {
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
	for (let i = 0; i<5; i++) {
		let token = generateToken();
		console.log(`Creating room with token: ${token}`)
		let res = await createRoom({
			name: `PopBot - Data Collection #${i}`,
			gameId: "popsauce", 
			isPublic: false,
			creatorUserToken: token,
		})
		if (!res) {throw new Error("wtf")}; 
		console.log(`Room created: https://jklm.fun/${res.roomCode}`);
		popbot(res.roomCode, token, true);
		popbot(res.roomCode, generateToken());
	}
}

createBotRooms();