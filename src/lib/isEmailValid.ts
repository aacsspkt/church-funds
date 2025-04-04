export function isEmailValid(email: string): boolean {
	return /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/.test(email);
}
