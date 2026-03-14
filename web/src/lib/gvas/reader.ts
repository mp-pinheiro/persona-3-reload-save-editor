const GVAS_MAGIC = new Uint8Array([0x47, 0x56, 0x41, 0x53]);

export class BinaryReader {
	private view: DataView;
	private offset: number;
	private readonly fileSize: number;
	private decoder: TextDecoder;

	constructor(buffer: ArrayBuffer) {
		this.view = new DataView(buffer);
		this.offset = 0;
		this.fileSize = buffer.byteLength;
		this.decoder = new TextDecoder('utf-8');
	}

	hasFinished(): boolean {
		return this.offset === this.fileSize;
	}

	readBytes(count: number): Uint8Array {
		const result = new Uint8Array(this.view.buffer.slice(this.offset, this.offset + count));
		this.offset += count;
		return result;
	}

	readInt8(): number {
		const value = this.view.getInt8(this.offset);
		this.offset += 1;
		return value;
	}

	readUInt8(): number {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value;
	}

	readInt16(): number {
		const value = this.view.getInt16(this.offset, true);
		this.offset += 2;
		return value;
	}

	readUInt16(): number {
		const value = this.view.getUint16(this.offset, true);
		this.offset += 2;
		return value;
	}

	readInt32(): number {
		const value = this.view.getInt32(this.offset, true);
		this.offset += 4;
		return value;
	}

	readUInt32(): number {
		const value = this.view.getUint32(this.offset, true);
		this.offset += 4;
		return value;
	}

	readFloat32(): number {
		const value = this.view.getFloat32(this.offset, true);
		this.offset += 4;
		return value;
	}

	readInt64(): bigint {
		const value = this.view.getBigInt64(this.offset, true);
		this.offset += 8;
		return value;
	}

	readString(): string {
		const length = this.readInt32();
		const bytes = new Uint8Array(this.view.buffer.slice(this.offset, this.offset + length - 1));
		this.offset += length;
		return this.decoder.decode(bytes);
	}

	readStringSpecial(): { value: string; isWide: boolean } {
		let length = this.readInt32();
		let isWide = false;
		let encoding: string = 'utf-8';
		let nullBytes = 1;

		if (length < 0) {
			length = Math.abs(length) * 2;
			isWide = true;
			encoding = 'utf-16-le';
			nullBytes = 2;
		}

		const bytes = new Uint8Array(this.view.buffer.slice(this.offset, this.offset + length - nullBytes));
		this.offset += length;

		const decoder = new TextDecoder(encoding);
		return { value: decoder.decode(bytes), isWide };
	}

	readBoolean(): boolean {
		const result = this.view.getUint8(this.offset) !== 0;
		this.offset += 1;
		return result;
	}

	readDateTime(): Date {
		const ticks = Number(this.readInt64());
		const timestamp = (ticks / 10000 - 62135596800000) / 1000;
		return new Date(timestamp);
	}

	skip(count: number): void {
		this.offset += count;
	}

	getOffset(): number {
		return this.offset;
	}
}
