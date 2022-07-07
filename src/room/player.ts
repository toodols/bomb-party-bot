import EventEmitter from "events";
import { Language, Profile, PublicAuth, Role } from "./types";

export class Player extends EventEmitter {
	id: number;
	nickname: string;
	language: Language;
	roles: Role[];
	auth?: PublicAuth;

	syncProfile(profile: Profile){
		this.nickname = profile.nickname;
		this.language = profile.language;
		this.roles = profile.roles;
		if (profile.auth) this.auth = profile.auth;
	}

	constructor(profile: Profile){
		super();
		this.syncProfile(profile);
		this.id = profile.peerId;
		this.nickname = profile.nickname;
		this.language = profile.language;
		this.roles = profile.roles;
		if (profile.auth) this.auth = profile.auth;
	}	
}

export interface Player {
	on(event: "left", callback: ()=>void): this;
}