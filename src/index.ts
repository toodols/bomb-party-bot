import { Room } from "./room";
import { webcrypto } from "crypto";
import { fetch } from "cross-fetch";

const crypto = webcrypto as unknown as Crypto;

export async function joinRoom(props: { id: string; nickname?: string; userToken: string, picture?: string }) {
	const url: string = await fetch("https://jklm.fun/api/joinRoom", {
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ roomCode: props.id }),
		method: "POST",
	})
		.then((res) => res.json())
		.then((e) => e.url);

	const r = new Room(url, {
		picture: props.picture,
		language: "en-US",
		nickname: props.nickname || "Guest",
		roomCode: props.id,
		userToken: props.userToken,
	});
	await r.readyPromise;
	return r;
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