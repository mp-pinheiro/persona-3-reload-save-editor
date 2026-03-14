export class BinaryWriter {
	private chunks: Uint8Array[];
	private totalLength: number;

	constructor() {
		this.chunks = [];
		this.totalLength = 0;
	}

	private writeBytes(bytes: Uint8Array): void {
		this.chunks.push(bytes);
		this.totalLength += bytes.length;
	}

	writeInt8(value: number): void {
		const bytes = new Uint8Array(1);
		new DataView(bytes.buffer).setInt8(0, value);
		this.writeBytes(bytes);
	}

	writeInt16(value: number): void {
		const bytes = new Uint8Array(2);
		new DataView(bytes.buffer).setInt16(0, value, true);
		this.writeBytes(bytes);
	}

	writeUInt16(value: number): void {
		const bytes = new Uint8Array(2);
		new DataView(bytes.buffer).setUint16(0, value, true);
		this.writeBytes(bytes);
	}

	writeInt32(value: number): void {
		const bytes = new Uint8Array(4);
		new DataView(bytes.buffer).setInt32(0, value, true);
		this.writeBytes(bytes);
	}

	writeUInt32(value: number): void {
		const bytes = new Uint8Array(4);
		new DataView(bytes.buffer).setUint32(0, value, true);
		this.writeBytes(bytes);
	}

	writeFloat32(value: number): void {
		const bytes = new Uint8Array(4);
		new DataView(bytes.buffer).setFloat32(0, value, true);
		this.writeBytes(bytes);
	}

	writeInt64(value: bigint | number): void {
		const bytes = new Uint8Array(8);
		const bigIntValue = typeof value === 'bigint' ? value : BigInt(value);
		new DataView(bytes.buffer).setBigInt64(0, bigIntValue, true);
		this.writeBytes(bytes);
	}

	writeString(str: string, isWide: boolean = false): void {
		if (str === '') {
			this.writeInt32(0);
			return;
		}

		const nullBytes = isWide ? 2 : 1;

		let encoded: Uint8Array;
		if (isWide) {
			encoded = new Uint8Array(str.length * 2);
			for (let i = 0; i < str.length; i++) {
				const code = str.charCodeAt(i);
				encoded[i * 2] = code & 0xff;
				encoded[i * 2 + 1] = (code >> 8) & 0xff;
			}
		} else {
			encoded = new TextEncoder().encode(str);
		}

		this.writeInt32(isWide ? -(str.length + 1) : encoded.length + nullBytes);
		this.writeBytes(encoded);

		for (let i = 0; i < nullBytes; i++) {
			this.writeInt8(0);
		}
	}

	writeBoolean(value: boolean): void {
		this.writeInt8(value ? 1 : 0);
	}

	writeDateTime(date: Date | number): void {
		let ticks: number;
		if (typeof date === 'number') {
			ticks = date;
		} else {
			const timestampMs = date.getTime();
			ticks = (timestampMs + 62135596800000) * 10000;
		}
		this.writeInt64(BigInt(ticks));
	}

	writeHexString(hex: string): void {
		const bytes = new Uint8Array(hex.match(/.{2}/g)?.map((byte) => parseInt(byte, 16)) || []);
		this.writeBytes(bytes);
	}

	writeRawBytes(bytes: Uint8Array): void {
		this.writeBytes(bytes);
	}

	toBuffer(): ArrayBuffer {
		const result = new Uint8Array(this.totalLength);
		let offset = 0;
		for (const chunk of this.chunks) {
			result.set(chunk, offset);
			offset += chunk.length;
		}
		return result.buffer;
	}
}
