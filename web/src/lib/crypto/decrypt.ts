const KEY = 'ae5zeitaix1joowooNgie3fahP5Ohph';
const KEYLEN = KEY.length;

export function decryptSave(data: Uint8Array): Uint8Array {
	const result = new Uint8Array(data.length);
	for (let i = 0; i < data.length; i++) {
		const keyIdx = i % KEYLEN;
		const bVar1 = data[i] ^ KEY.charCodeAt(keyIdx);
		result[i] = ((bVar1 >> 4) & 3) | ((bVar1 & 3) << 4) | (bVar1 & 0xcc);
	}
	return result;
}

export function encryptSave(data: Uint8Array): Uint8Array {
	const result = new Uint8Array(data.length);
	for (let i = 0; i < data.length; i++) {
		const keyIdx = i % KEYLEN;
		const encrypted = (((data[i] & 0xff) >> 4) & 3) | ((data[i] & 3) << 4) | (data[i] & 0xcc);
		result[i] = encrypted ^ KEY.charCodeAt(keyIdx);
	}
	return result;
}

export function isSaveEncrypted(data: Uint8Array): boolean {
	const GVAS_MAGIC = [0x47, 0x56, 0x41, 0x53]; // "GVAS"
	for (let i = 0; i < 4; i++) {
		if (data[i] === GVAS_MAGIC[i]) return false;
	}
	return true;
}

export async function processSaveFile(arrayBuffer: ArrayBuffer): Promise<Uint8Array> {
	const data = new Uint8Array(arrayBuffer);
	if (isSaveEncrypted(data)) {
		return decryptSave(data);
	}
	return data;
}

export async function encryptForExport(data: Uint8Array, wasEncrypted: boolean): Promise<Uint8Array> {
	if (wasEncrypted) {
		return encryptSave(data);
	}
	return data;
}
