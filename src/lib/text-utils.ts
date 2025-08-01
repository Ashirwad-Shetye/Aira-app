
export function generateSnippet( html: string, maxLength = 160 ): string {
  const plain = html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > maxLength ? plain.slice(0, maxLength) + "..." : plain;
}

export const getInitialChar = ( str: string ) => {
  return str
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();
}