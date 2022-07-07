export interface PrivateAuth {
	service: "discord",
	token: string,
	expiration: number,
	username: string,
}

export interface PublicAuth {
	service: "discord",
	id: string,
	username: string,
}

export type Role = "leader"

export interface Profile {peerId: number, nickname: string, language: Language, roles: Role[], auth: PublicAuth | null}

export interface ProfileWithOnline {
	profile: Profile,
	online: boolean,
}

export type PlayerId = number;

export type Language = "en-US"