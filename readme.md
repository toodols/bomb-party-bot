# bomb-party-bot
### A lightweight up-to-date JKLM.FUN API wrapper which can be used to develop bots for (primarily) Bomb Party and Pop Sauce.
Included in this package are type declarations and an abstraction for each to use bot development.

> Disclaimer: dictionaries are not included in this package. Use [bomb-party-word-searcher](https://www.npmjs.com/package/bomb-party-word-searcher) for a list of english words.
## Installation
Install the package using [npm](https://www.npmjs.com/) to get started.

```npm install bomb-party-bot```
## Usage
### ES6 Typescript Example
```js
import { generateToken, joinRoom } from "bomb-party-bot";

export async function helloWorld(roomid: string, token = generateToken(), master=false) {
	let room = await joinRoom({roomid, "username", token})

	room.on("chat", (player, message)=>{
		if (message.toLowerCase() == '!ping') {
            room.chat("Pong.")
		}
	})
}
```
## Collaborators
| User        | Description |
| ----------- | ----------- |
| [dragonismcode](https://github.com/dragonismcode) | Co-authorted Pop Sauce API |
