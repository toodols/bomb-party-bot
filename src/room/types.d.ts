interface Auth {
	service: "discord",
	token: string,
	expiration: number,
	username: string,
}

type Role = "leader"

interface Profile {peerId: number, nickname: string, language: Language, roles: Role[], auth: Auth | null}

interface ProfileWithOnline {
	profile: Profile,
	online: boolean,
}

type PlayerId = number;
