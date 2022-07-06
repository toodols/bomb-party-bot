import { games, Room } from "./room";
import { webcrypto } from "crypto";
import { fetch } from "cross-fetch";
import { BombParty } from "./game/bombparty";
import { PrivateAuth } from "./room/types";

const crypto = webcrypto as unknown as Crypto;

export * from "./room";
export * from "./game/bombparty"
export * from "./game/gameselector"
export * from "./game/popsauce";

export async function joinRoom(props: { id: string; nickname?: string; userToken: string, picture?: string, auth?: PrivateAuth }, url?: string) {
	if (!url) {
		url = await fetch("https://jklm.fun/api/joinRoom", {
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ roomCode: props.id }),
			method: "POST",
		})
			.then((res) => res.json())
			.then((e) => e.url);
	}

	const r = new Room(url!, {
		picture: props.picture,
		language: "en-US",
		nickname: props.nickname || "Guest",
		roomCode: props.id,
		userToken: props.userToken,
		auth: props.auth,
	});
	await r.readyPromise;
	return r;
}

/**
 * Creates a room
 * @returns The created id and server url or null if it failed
 * let token = "abcdef";
 * let {url, roomCode} = await createRoom({creatorUserToken: token, name: "Amazing room", gameId: "popsauce", isPublic: false});
 * let room = await joinRoom({id: roomCode, userToken: token}, url);
 */
export async function createRoom(props: {creatorUserToken: string, gameId: keyof typeof games, isPublic: boolean, name: string}): Promise<{url: string, roomCode: string} | null> {
	let response: {roomCode: string, url: string} | null = null;
	try {
		response = await fetch("https://jklm.fun/api/startRoom", {
			body: JSON.stringify(props),
			method: "POST",
			headers: { "content-type": "application/json" },
		}).then((res) =>{
			if(res.status == 200) {
				return res.json();
			} else if(res.status == 429) {
				throw new Error("Too many requests");
			}
			return null;
		});
	} catch (e) {
		// error
	}
	return response;
}

// token generation is done on the client
export function generateToken() {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	let token = "";
	const digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";
	for (let i = 0; i < array.length; i++) token += digits[array[i] % digits.length];
	return token;
}