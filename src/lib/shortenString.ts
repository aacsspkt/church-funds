/**
 * Shortens a string to a specified length and adds an ellipsis.
 * @param str - The string to shorten.
 * @param maxLength - The maximum length of the shortened string.
 * @param position - The position of the ellipsis: 'end' or 'middle'. Defaults to 'end'.
 * @returns The shortened string with an ellipsis.
 */
export function shortenString(
	str: string,
	maxLength: number,
	position: "end" | "middle" = "end",
): string {
	if (str.length <= maxLength) {
		return str;
	}

	if (position === "end") {
		return str.slice(0, maxLength - 3) + "...";
	} else if (position === "middle") {
		const halfLength = Math.floor((maxLength - 3) / 2);
		return str.slice(0, halfLength) + "..." + str.slice(str.length - halfLength);
	}

	throw new Error("Invalid position argument. Use 'end' or 'middle'.");
}
