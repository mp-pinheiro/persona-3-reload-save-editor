// @ts-nocheck
import { BinaryReader } from './reader.js';
import { BinaryWriter } from './writer.js';
import { PropertyType } from './types.js';
import type { GVASData, AnyPropertyData } from './types.js';

const FILE_END_BYTES = new Uint8Array([
	0x05, 0x00, 0x00, 0x00, 0x4e, 0x6f, 0x6e, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00
]);

const BOOL_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const INT_PADDING = new Uint8Array([0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const INT8_PADDING = new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const INT64_PADDING = new Uint8Array([0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const UINT16_PADDING = new Uint8Array([0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const FLOAT_PADDING = new Uint8Array([0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const STR_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const BYTE_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
const BYTE_UNKNOWN = new Uint8Array([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00
]);
const STRUCT_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
const STRUCT_UNKNOWN = new Uint8Array([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00
]);
const ARRAY_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
const ARRAY_UNKNOWN = new Uint8Array([
	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
	0x00, 0x00
]);
const MULTICAST_UNKNOWN = new Uint8Array([0x01, 0x00, 0x00, 0x00]);
const MULTICAST_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]);
const OBJECT_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]);
const ENUM_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
const MAP_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
const SET_PADDING = new Uint8Array([0x00, 0x00, 0x00, 0x00]);

class PropertyParser {
	constructor(private reader: BinaryReader) {}

	readHeader(): GVASData {
		const magic = this.reader.readBytes(4);
		if (magic[0] !== 0x47 || magic[1] !== 0x56 || magic[2] !== 0x41 || magic[3] !== 0x53) {
			throw new Error('Invalid GVAS file: missing magic bytes');
		}
		const saveGameVersion = this.reader.readInt32();
		const packageVersion = this.reader.readInt32();
		const engineMajor = this.reader.readInt16();
		const engineMinor = this.reader.readInt16();
		const enginePatch = this.reader.readInt16();
		const engineVersion = `${engineMajor}.${engineMinor}.${enginePatch}`;
		const engineBuild = this.reader.readUInt32();
		const engineBranch = this.reader.readString();
		const customVersionFormat = this.reader.readInt32();
		const numCustomVersions = this.reader.readInt32();
		const customVersions = [];
		for (let i = 0; i < numCustomVersions; i++) {
			const guid = this.reader.readBytes(16);
			const version = this.reader.readInt32();
			customVersions.push({ guid, version });
		}
		const saveGameClassName = this.reader.readString();
		return {
			type: PropertyType.HeaderProperty,
			saveGameVersion,
			packageVersion,
			engineVersion,
			engineBuild,
			engineBranch,
			customVersionFormat,
			customVersions,
			saveGameClassName
		} as any;
	}

	readProperty(): GVASData | null {
		const currentOffset = this.reader.getOffset();
		const remaining = this.reader['fileSize'] - currentOffset;

		if (remaining === FILE_END_BYTES.length) {
			const potentialEnd = this.reader.readBytes(FILE_END_BYTES.length);
			let isFileEnd = true;
			for (let i = 0; i < FILE_END_BYTES.length; i++) {
				if (potentialEnd[i] !== FILE_END_BYTES[i]) {
					isFileEnd = false;
					break;
				}
			}
			if (isFileEnd) {
				return { type: 'FileEndProperty' };
			}
			this.reader['offset'] = currentOffset;
		}

		const name = this.reader.readString();

		if (name === 'None') {
			return { type: PropertyType.NoneProperty } as any;
		}

		const propType = this.reader.readString();

		switch (propType) {
			case PropertyType.HeaderProperty:
				return this.readHeaderProperty(name);
			case PropertyType.BoolProperty:
				return this.readBoolProperty(name);
			case PropertyType.IntProperty:
				return this.readIntProperty(name);
			case PropertyType.Int8Property:
				return this.readInt8Property(name);
			case PropertyType.Int64Property:
				return this.readInt64Property(name);
			case PropertyType.UInt32Property:
				return this.readUInt32Property(name);
			case PropertyType.UInt16Property:
				return this.readUInt16Property(name);
			case PropertyType.FloatProperty:
				return this.readFloatProperty(name);
			case PropertyType.EnumProperty:
				return this.readEnumProperty(name);
			case PropertyType.StructProperty:
				return this.readStructProperty(name);
			case PropertyType.ByteProperty:
				return this.readByteProperty(name);
			case PropertyType.StrProperty:
				return this.readStrProperty(name);
			case PropertyType.NameProperty:
				return this.readNameProperty(name);
			case PropertyType.SetProperty:
				return this.readSetProperty(name);
			case PropertyType.ArrayProperty:
				return this.readArrayProperty(name);
			case PropertyType.ObjectProperty:
				return this.readObjectProperty(name);
			case PropertyType.SoftObjectProperty:
				return this.readSoftObjectProperty(name);
			case PropertyType.MulticastInlineDelegateProperty:
				return this.readMulticastInlineDelegateProperty(name);
			case PropertyType.MapProperty:
				return this.readMapProperty(name);
			default:
				throw new Error(`Unknown property type: ${propType}`);
		}
	}

	private readHeaderProperty(_name: string) {
		const saveGameVersion = this.reader.readInt32();
		const packageVersion = this.reader.readInt32();
		const engineMajor = this.reader.readInt16();
		const engineMinor = this.reader.readInt16();
		const enginePatch = this.reader.readInt16();
		const engineVersion = `${engineMajor}.${engineMinor}.${enginePatch}`;
		const engineBuild = this.reader.readUInt32();
		const engineBranch = this.reader.readString();
		const customVersionFormat = this.reader.readInt32();
		const numCustomVersions = this.reader.readInt32();
		const customVersions = [];
		for (let i = 0; i < numCustomVersions; i++) {
			const guid = this.reader.readBytes(16);
			const version = this.reader.readInt32();
			customVersions.push({ guid, version });
		}
		const saveGameClassName = this.reader.readString();

		return {
			type: PropertyType.HeaderProperty,
			saveGameVersion,
			packageVersion,
			engineVersion,
			engineBuild,
			engineBranch,
			customVersionFormat,
			customVersions,
			saveGameClassName
		} as any;
	}

	private readBoolProperty(name: string) {
		this.reader.readBytes(BOOL_PADDING.length);
		const value = this.reader.readBoolean();
		this.reader.readBytes(1);
		return { type: PropertyType.BoolProperty, name, value } as any;
	}

	private readIntProperty(name: string) {
		const paddingStatic = this.reader.readBytes(4);
		const padding = this.reader.readBytes(4);
		this.reader.readBytes(1);
		const value = this.reader.readInt32();
		return { type: PropertyType.IntProperty, name, paddingStatic, padding, value } as any;
	}

	private readInt8Property(name: string) {
		const paddingStatic = this.reader.readBytes(4);
		const padding = this.reader.readBytes(4);
		this.reader.readBytes(1);
		const value = this.reader.readInt8();
		return { type: PropertyType.Int8Property, name, paddingStatic, padding, value } as any;
	}

	private readInt64Property(name: string) {
		this.reader.readBytes(INT64_PADDING.length);
		const value = this.reader.readInt64();
		return { type: PropertyType.Int64Property, name, value } as any;
	}

	private readUInt32Property(name: string) {
		const paddingStatic = this.reader.readBytes(4);
		const padding = this.reader.readBytes(4);
		this.reader.readBytes(1);
		const value = this.reader.readUInt32();
		return { type: PropertyType.UInt32Property, name, paddingStatic, padding, value } as any;
	}

	private readUInt16Property(name: string) {
		const paddingStatic = this.reader.readBytes(4);
		const padding = this.reader.readBytes(4);
		this.reader.readBytes(1);
		const value = this.reader.readUInt16();
		return { type: PropertyType.UInt16Property, name, paddingStatic, padding, value } as any;
	}

	private readFloatProperty(name: string) {
		this.reader.readBytes(FLOAT_PADDING.length);
		const value = this.reader.readFloat32();
		return { type: PropertyType.FloatProperty, name, value } as any;
	}

	private readEnumProperty(name: string) {
		this.reader.readUInt32();
		this.reader.readBytes(ENUM_PADDING.length);
		const enumType = this.reader.readString();
		this.reader.readBytes(1);
		const value = this.reader.readString();
		return { type: PropertyType.EnumProperty, name, enum: enumType, value } as any;
	}

	private readStructProperty(name: string) {
		const contentSize = this.reader.readUInt32();
		this.reader.readBytes(4);
		const subtype = this.reader.readString();
		this.reader.readBytes(17);
		const endPosition = this.reader.getOffset() + contentSize;

		if (subtype === 'Guid') {
			const value = this.reader.readBytes(16);
			return { type: PropertyType.StructProperty, name, subtype, value } as any;
		}

		if (subtype === 'DateTime') {
			const value = this.reader.readDateTime();
			return { type: PropertyType.StructProperty, name, subtype, value } as any;
		}

		if (subtype === 'Quat' || subtype === 'Vector' || subtype === 'Rotator') {
			const value = this.reader.readBytes(contentSize);
			return { type: PropertyType.StructProperty, name, subtype, value } as any;
		}

		const value: GVASData[] = [];
		while (this.reader.getOffset() < endPosition) {
			const prop = this.readProperty();
			if (prop) value.push(prop);
		}

		return { type: PropertyType.StructProperty, name, subtype, value } as any;
	}

	private readByteProperty(name: string) {
		const contentSize = this.reader.readUInt32();
		this.reader.readBytes(4);
		const subtype = this.reader.readString();
		this.reader.readBytes(1);

		if (subtype === 'StructProperty') {
			const contentCount = this.reader.readUInt32();
			const nameAgain = this.reader.readString();
			if (nameAgain !== name) throw new Error('Name mismatch in ByteProperty');
			const subtypeAgain = this.reader.readString();
			if (subtypeAgain !== subtype) throw new Error('Subtype mismatch in ByteProperty');
			this.reader.readUInt32();
			this.reader.readBytes(BYTE_PADDING.length);
			const genericType = this.reader.readString();
			const unknown = this.reader.readBytes(17);
			if (unknown[0] !== BYTE_UNKNOWN[0]) throw new Error('Unknown byte mismatch in ByteProperty');

			const value: Uint8Array[] | GVASData[][] = [];

			if (genericType === 'Guid') {
				for (let i = 0; i < contentCount; i++) {
					value.push(this.reader.readBytes(16));
				}
			} else {
				for (let i = 0; i < contentCount; i++) {
					const structElement: GVASData[] = [];
					let childProp: GVASData | null;
					do {
						childProp = this.readProperty();
						if (childProp) structElement.push(childProp);
					} while (childProp?.type !== PropertyType.NoneProperty);
					value.push(structElement);
				}
			}

			return { type: PropertyType.ByteProperty, name, subtype, genericType, value } as any;
		}

		const bytes = this.reader.readBytes(contentSize);
		let value = 0;
		for (let i = 0; i < bytes.length; i++) {
			value = (value << 8) | bytes[i];
		}
		return { type: PropertyType.ByteProperty, name, subtype, value } as any;
	}

	private readStrProperty(name: string) {
		const unknown = this.reader.readBytes(1);
		this.reader.readBytes(STR_PADDING.length);
		const { value, isWide } = this.reader.readStringSpecial();
		const result = { type: PropertyType.StrProperty, name, unknown, value };
		if (isWide) (result as any).wide = true;
		return result as any;
	}

	private readNameProperty(name: string) {
		const unknown = this.reader.readBytes(1);
		this.reader.readBytes(STR_PADDING.length);
		const value = this.reader.readString();
		return { type: PropertyType.NameProperty, name, unknown, value } as any;
	}

	private readSetProperty(name: string) {
		const contentSize = this.reader.readUInt32();
		this.reader.readBytes(SET_PADDING.length);
		const subtype = this.reader.readString();
		this.reader.readBytes(1);

		if (subtype === 'StructProperty') {
			this.reader.readBytes(SET_PADDING.length);
			const contentCount = this.reader.readUInt32();
			const value: GVASData[][] = [];

			for (let i = 0; i < contentCount; i++) {
				const structElement: GVASData[] = [];
				let childProp: GVASData | null;
				do {
					childProp = this.readProperty();
					if (childProp) structElement.push(childProp);
				} while (childProp?.type !== PropertyType.NoneProperty);
				value.push(structElement);
			}

			return { type: PropertyType.SetProperty, name, subtype, value } as any;
		}

		if (subtype === 'NameProperty') {
			this.reader.readBytes(4);
			const contentCount = this.reader.readUInt32();
			const value: string[] = [];
			for (let i = 0; i < contentCount; i++) {
				value.push(this.reader.readString());
			}
			return { type: PropertyType.SetProperty, name, subtype, value } as any;
		}

		const value = this.reader.readBytes(contentSize);
		return { type: PropertyType.SetProperty, name, subtype, value } as any;
	}

	private readArrayProperty(name: string) {
		const contentSize = this.reader.readUInt32();
		this.reader.readBytes(4);
		const subtype = this.reader.readString();
		this.reader.readBytes(1);

		if (subtype === 'StructProperty') {
			const contentCount = this.reader.readUInt32();
			const nameAgain = this.reader.readString();
			if (nameAgain !== name) throw new Error('Name mismatch in ArrayProperty');
			const subtypeAgain = this.reader.readString();
			if (subtypeAgain !== subtype) throw new Error('Subtype mismatch in ArrayProperty');
			this.reader.readUInt32();
			this.reader.readBytes(ARRAY_PADDING.length);
			const genericType = this.reader.readString();
			const unknown = this.reader.readBytes(17);
			if (unknown[0] !== ARRAY_UNKNOWN[0]) throw new Error('Unknown byte mismatch in ArrayProperty');

			const value: Uint8Array[] | GVASData[][] = [];

			if (genericType === 'Guid') {
				for (let i = 0; i < contentCount; i++) {
					value.push(this.reader.readBytes(16));
				}
			} else {
				for (let i = 0; i < contentCount; i++) {
					const structElement: GVASData[] = [];
					let childProp: GVASData | null;
					do {
						childProp = this.readProperty();
						if (childProp) structElement.push(childProp);
					} while (childProp?.type !== PropertyType.NoneProperty);
					value.push(structElement);
				}
			}

			return { type: PropertyType.ArrayProperty, name, subtype, genericType, value } as any;
		}

		if (
			subtype === 'ObjectProperty' ||
			subtype === 'EnumProperty' ||
			subtype === 'NameProperty' ||
			subtype === 'StrProperty'
		) {
			const contentCount = this.reader.readUInt32();
			const value: string[] = [];
			for (let i = 0; i < contentCount; i++) {
				value.push(this.reader.readString());
			}
			return { type: PropertyType.ArrayProperty, name, subtype, value } as any;
		}

		const value = this.reader.readBytes(contentSize);
		return { type: PropertyType.ArrayProperty, name, subtype, value } as any;
	}

	private readObjectProperty(name: string) {
		this.reader.readUInt32();
		this.reader.readBytes(OBJECT_PADDING.length);
		const value = this.reader.readString();
		return { type: PropertyType.ObjectProperty, name, value } as any;
	}

	private readSoftObjectProperty(name: string) {
		this.reader.readUInt32();
		this.reader.readBytes(OBJECT_PADDING.length);
		const value = this.reader.readString();
		this.reader.readBytes(4);
		return { type: PropertyType.SoftObjectProperty, name, value } as any;
	}

	private readMulticastInlineDelegateProperty(name: string) {
		this.reader.readUInt32();
		this.reader.readBytes(MULTICAST_PADDING.length);
		this.reader.readBytes(MULTICAST_UNKNOWN.length);
		const objectName = this.reader.readString();
		const functionName = this.reader.readString();
		return {
			type: PropertyType.MulticastInlineDelegateProperty,
			name,
			objectName,
			functionName
		};
	}

	private readMapProperty(name: string) {
		this.reader.readUInt32();
		this.reader.readBytes(MAP_PADDING.length);
		const keyType = this.reader.readString();
		const valueType = this.reader.readString();
		this.reader.readBytes(1);
		this.reader.readBytes(MAP_PADDING.length);
		const contentCount = this.reader.readUInt32();

		const value: [unknown, unknown][] = [];

		for (let i = 0; i < contentCount; i++) {
			let currentKey: unknown = null;
			let currentValue: unknown = null;

			if (keyType === 'StructProperty') {
				currentKey = this.reader.readBytes(16);
			} else if (keyType === 'IntProperty') {
				currentKey = this.reader.readInt32();
			} else if (keyType === 'StrProperty' || keyType === 'NameProperty') {
				currentKey = this.reader.readString();
			} else {
				throw new Error(`Key Type not implemented: ${keyType}`);
			}

			if (valueType === 'StructProperty') {
				const structValue: GVASData[] = [];
				let prop: GVASData | null;
				do {
					prop = this.readProperty();
					if (prop) structValue.push(prop);
				} while (prop?.type !== PropertyType.NoneProperty);
				currentValue = structValue;
			} else if (valueType === 'IntProperty') {
				currentValue = this.reader.readInt32();
			} else if (valueType === 'FloatProperty') {
				currentValue = this.reader.readFloat32();
			} else if (valueType === 'StrProperty' || valueType === 'EnumProperty') {
				currentValue = this.reader.readString();
			} else if (valueType === 'BoolProperty') {
				currentValue = this.reader.readBoolean();
			} else {
				throw new Error(`Value Type not implemented: ${valueType}`);
			}

			value.push([currentKey, currentValue]);
		}

		return { type: PropertyType.MapProperty, name, keyType, valueType, value } as any;
	}
}

class PropertySerializer {
	constructor(private writer: BinaryWriter) {}

	serializeProperty(prop: GVASData): void {
		switch (prop.type) {
			case PropertyType.HeaderProperty:
				this.writeHeaderProperty(prop as any);
				break;
			case PropertyType.NoneProperty:
				this.writeNoneProperty();
				break;
			case PropertyType.FileEndProperty:
				this.writeFileEndProperty();
				break;
			case PropertyType.BoolProperty:
				this.writeBoolProperty(prop as any);
				break;
			case PropertyType.IntProperty:
				this.writeIntProperty(prop as any);
				break;
			case PropertyType.Int8Property:
				this.writeInt8Property(prop as any);
				break;
			case PropertyType.Int64Property:
				this.writeInt64Property(prop as any);
				break;
			case PropertyType.UInt32Property:
				this.writeUInt32Property(prop as any);
				break;
			case PropertyType.UInt16Property:
				this.writeUInt16Property(prop as any);
				break;
			case PropertyType.FloatProperty:
				this.writeFloatProperty(prop as any);
				break;
			case PropertyType.EnumProperty:
				this.writeEnumProperty(prop as any);
				break;
			case PropertyType.StructProperty:
				this.writeStructProperty(prop as any);
				break;
			case PropertyType.ByteProperty:
				this.writeByteProperty(prop as any);
				break;
			case PropertyType.StrProperty:
				this.writeStrProperty(prop as any);
				break;
			case PropertyType.NameProperty:
				this.writeNameProperty(prop as any);
				break;
			case PropertyType.SetProperty:
				this.writeSetProperty(prop as any);
				break;
			case PropertyType.ArrayProperty:
				this.writeArrayProperty(prop as any);
				break;
			case PropertyType.ObjectProperty:
				this.writeObjectProperty(prop as any);
				break;
			case PropertyType.SoftObjectProperty:
				this.writeSoftObjectProperty(prop as any);
				break;
			case PropertyType.MulticastInlineDelegateProperty:
				this.writeMulticastInlineDelegateProperty(prop as any);
				break;
			case PropertyType.MapProperty:
				this.writeMapProperty(prop as any);
				break;
			default:
				throw new Error(`Unknown property type: ${(prop as any).type}`);
		}
	}

	private writeNoneProperty(): void {
		this.writer.writeString('None');
	}

	private writeFileEndProperty(): void {
		this.writer.writeString('None');
		this.writer.writeRawBytes(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
	}

	private writeHeaderProperty(prop: any): void {
		this.writer.writeRawBytes(new Uint8Array([0x47, 0x56, 0x41, 0x53]));
		this.writer.writeInt32(prop.saveGameVersion);
		this.writer.writeInt32(prop.packageVersion);
		const parts = prop.engineVersion.split('.');
		this.writer.writeInt16(parseInt(parts[0]));
		this.writer.writeInt16(parseInt(parts[1]));
		this.writer.writeInt16(parseInt(parts[2]));
		this.writer.writeUInt32(prop.engineBuild);
		this.writer.writeString(prop.engineBranch);
		this.writer.writeInt32(prop.customVersionFormat);
		this.writer.writeInt32(prop.customVersions.length);
		for (const cv of prop.customVersions) {
			this.writer.writeRawBytes(cv.guid);
			this.writer.writeInt32(cv.version);
		}
		this.writer.writeString(prop.saveGameClassName);
	}

	private writeBoolProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('BoolProperty');
		this.writer.writeRawBytes(BOOL_PADDING);
		this.writer.writeBoolean(prop.value);
		this.writer.writeInt8(0);
	}

	private writeIntProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('IntProperty');
		this.writer.writeRawBytes((prop as any).paddingStatic);
		this.writer.writeRawBytes((prop as any).padding);
		this.writer.writeInt8(0);
		this.writer.writeInt32(prop.value as number);
	}

	private writeInt8Property(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('Int8Property');
		this.writer.writeRawBytes((prop as any).paddingStatic);
		this.writer.writeRawBytes((prop as any).padding);
		this.writer.writeInt8(0);
		this.writer.writeInt8(prop.value as number);
	}

	private writeInt64Property(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('Int64Property');
		this.writer.writeRawBytes(INT64_PADDING);
		this.writer.writeInt64(prop.value as bigint);
	}

	private writeUInt32Property(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('UInt32Property');
		this.writer.writeRawBytes((prop as any).paddingStatic);
		this.writer.writeRawBytes((prop as any).padding);
		this.writer.writeInt8(0);
		this.writer.writeUInt32(prop.value as number);
	}

	private writeUInt16Property(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('UInt16Property');
		this.writer.writeRawBytes((prop as any).paddingStatic);
		this.writer.writeRawBytes((prop as any).padding);
		this.writer.writeInt8(0);
		this.writer.writeUInt16(prop.value as number);
	}

	private writeFloatProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('FloatProperty');
		this.writer.writeRawBytes(FLOAT_PADDING);
		this.writer.writeFloat32(prop.value as number);
	}

	private writeEnumProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('EnumProperty');
		const value = (prop as any).value;
		this.writer.writeUInt32(value.length + 5);
		this.writer.writeRawBytes(ENUM_PADDING);
		this.writer.writeString((prop as any).enum);
		this.writer.writeInt8(0);
		this.writer.writeString(value);
	}

	private writeStructProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('StructProperty');
		const subtype = (prop as any).subtype;
		const value = prop.value;

		if (subtype === 'Guid') {
			this.writer.writeUInt32(16);
			this.writer.writeRawBytes(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
			this.writer.writeString('Guid');
			this.writer.writeRawBytes(STRUCT_UNKNOWN);
			this.writer.writeRawBytes(value as Uint8Array);
		} else if (subtype === 'DateTime') {
			this.writer.writeUInt32(8);
			this.writer.writeRawBytes(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
			this.writer.writeString('DateTime');
			this.writer.writeRawBytes(STRUCT_UNKNOWN);
			this.writer.writeDateTime(value as Date);
		} else if (subtype === 'Quat' || subtype === 'Vector' || subtype === 'Rotator') {
			const bytes = value as Uint8Array;
			this.writer.writeUInt32(bytes.length);
			this.writer.writeRawBytes(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
			this.writer.writeString(subtype);
			this.writer.writeRawBytes(STRUCT_UNKNOWN);
			this.writer.writeRawBytes(bytes);
		} else {
			const contentWriter = new BinaryWriter();
			const contentSerializer = new PropertySerializer(contentWriter);
			for (const item of value as GVASData[]) {
				contentSerializer.serializeProperty(item);
			}
			const contentBytes = new Uint8Array(contentWriter.toBuffer());

			this.writer.writeUInt32(contentBytes.length);
			this.writer.writeRawBytes(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
			this.writer.writeString(subtype);
			this.writer.writeRawBytes(STRUCT_UNKNOWN);
			this.writer.writeRawBytes(contentBytes);
		}
	}

	private writeByteProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('ByteProperty');
		const subtype = (prop as any).subtype;
		const value = prop.value;

		if (subtype === 'StructProperty') {
			const contentSerializer = new PropertySerializer(new BinaryWriter());
			const genericType = (prop as any).genericType;

			let contentBytes: Uint8Array;

			if (genericType === 'Guid') {
				const guidWriter = new BinaryWriter();
				for (const guid of value as Uint8Array[]) {
					guidWriter.writeRawBytes(guid);
				}
				contentBytes = new Uint8Array(guidWriter.toBuffer());
			} else {
				const contentWriter = new BinaryWriter();
				const contentSerializer = new PropertySerializer(contentWriter);
				for (const item of value as GVASData[][]) {
					for (const child of item) {
						contentSerializer.serializeProperty(child);
					}
					const noneSerializer = new PropertySerializer(contentWriter);
					noneSerializer.writeNoneProperty();
				}
				contentBytes = new Uint8Array(contentWriter.toBuffer());
			}

			const contentSize =
				4 +
				4 +
				prop.name.length +
				1 +
				4 +
				subtype.length +
				1 +
				4 +
				BYTE_PADDING.length +
				4 +
				genericType.length +
				1 +
				BYTE_UNKNOWN.length +
				contentBytes.length;

			this.writer.writeUInt32(contentSize);
			this.writer.writeRawBytes(BYTE_PADDING);
			this.writer.writeString(subtype);
			this.writer.writeInt8(0);
			this.writer.writeUInt32((value as any).length);
			this.writer.writeString(prop.name);
			this.writer.writeString(subtype);
			this.writer.writeUInt32(contentBytes.length);
			this.writer.writeRawBytes(BYTE_PADDING);
			this.writer.writeString(genericType);
			this.writer.writeRawBytes(BYTE_UNKNOWN);
			this.writer.writeRawBytes(contentBytes);
		} else {
			const numBytes = Math.ceil(Math.log2((value as number) + 1) / 8);
			this.writer.writeUInt32(numBytes);
			this.writer.writeRawBytes(BYTE_PADDING);
			this.writer.writeString(subtype);
			this.writer.writeInt8(0);

			const bytes = new Uint8Array(numBytes);
			for (let i = 0; i < numBytes; i++) {
				bytes[numBytes - 1 - i] = ((value as number) >> (i * 8)) & 0xff;
			}
			this.writer.writeRawBytes(bytes);
		}
	}

	private writeStrProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('StrProperty');
		this.writer.writeRawBytes((prop as any).unknown);
		this.writer.writeRawBytes(STR_PADDING);
		this.writer.writeString(prop.value as string, (prop as any).wide);
	}

	private writeNameProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('NameProperty');
		this.writer.writeRawBytes((prop as any).unknown);
		this.writer.writeRawBytes(STR_PADDING);
		this.writer.writeString(prop.value as string);
	}

	private writeSetProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('SetProperty');
		const subtype = (prop as any).subtype;
		const value = prop.value;

		if (subtype === 'StructProperty') {
			const contentWriter = new BinaryWriter();
			const contentSerializer = new PropertySerializer(contentWriter);
			for (const item of value as GVASData[][]) {
				for (const child of item) {
					contentSerializer.serializeProperty(child);
				}
				const noneSerializer = new PropertySerializer(contentWriter);
				noneSerializer.writeNoneProperty();
			}
			const contentBytes = new Uint8Array(contentWriter.toBuffer());
			const contentSize = 4 + 4 + contentBytes.length;

			this.writer.writeUInt32(contentSize);
			this.writer.writeRawBytes(SET_PADDING);
			this.writer.writeString(subtype);
			this.writer.writeInt8(0);
			this.writer.writeRawBytes(SET_PADDING);
			this.writer.writeUInt32((value as any).length);
			this.writer.writeRawBytes(contentBytes);
		} else if (subtype === 'NameProperty') {
			const contentWriter = new BinaryWriter();
			for (const item of value as string[]) {
				contentWriter.writeString(item);
			}
			const contentBytes = new Uint8Array(contentWriter.toBuffer());
			const contentSize = contentBytes.length + 8;

			this.writer.writeUInt32(contentSize);
			this.writer.writeRawBytes(SET_PADDING);
			this.writer.writeString(subtype);
			this.writer.writeInt8(0);
			this.writer.writeRawBytes(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]));
			this.writer.writeUInt32((value as any).length);
			this.writer.writeRawBytes(contentBytes);
		} else {
			this.writer.writeUInt32((value as Uint8Array).length);
			this.writer.writeRawBytes(SET_PADDING);
			this.writer.writeString(subtype);
			this.writer.writeInt8(0);
			this.writer.writeRawBytes(value as Uint8Array);
		}
	}

	private writeArrayProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('ArrayProperty');
		const subtype = (prop as any).subtype;
		const value = prop.value;

		if (subtype === 'StructProperty') {
			const genericType = (prop as any).genericType;

			let contentBytes: Uint8Array;

			if (genericType === 'Guid') {
				const guidWriter = new BinaryWriter();
				for (const guid of value as Uint8Array[]) {
					guidWriter.writeRawBytes(guid);
				}
				contentBytes = new Uint8Array(guidWriter.toBuffer());
			} else {
				const contentWriter = new BinaryWriter();
				const contentSerializer = new PropertySerializer(contentWriter);
				for (const item of value as GVASData[][]) {
					for (const child of item) {
						contentSerializer.serializeProperty(child);
					}
					const noneSerializer = new PropertySerializer(contentWriter);
					noneSerializer.writeNoneProperty();
				}
				contentBytes = new Uint8Array(contentWriter.toBuffer());
			}

			const contentSize =
				4 +
				4 +
				prop.name.length +
				1 +
				4 +
				subtype.length +
				1 +
				4 +
				ARRAY_PADDING.length +
				4 +
				genericType.length +
				1 +
				ARRAY_UNKNOWN.length +
				contentBytes.length;

			this.writer.writeUInt32(contentSize);
			this.writer.writeRawBytes(ARRAY_PADDING);
			this.writer.writeString(subtype);
			this.writer.writeInt8(0);
			this.writer.writeUInt32((value as any).length);
			this.writer.writeString(prop.name);
			this.writer.writeString(subtype);
			this.writer.writeUInt32(contentBytes.length);
			this.writer.writeRawBytes(ARRAY_PADDING);
			this.writer.writeString(genericType);
			this.writer.writeRawBytes(ARRAY_UNKNOWN);
			this.writer.writeRawBytes(contentBytes);
		} else if (
			subtype === 'ObjectProperty' ||
			subtype === 'EnumProperty' ||
			subtype === 'NameProperty' ||
			subtype === 'StrProperty'
		) {
			const contentWriter = new BinaryWriter();
			for (const item of value as string[]) {
				contentWriter.writeString(item);
			}
			const contentBytes = new Uint8Array(contentWriter.toBuffer());
			const contentSize = contentBytes.length + 4;

			this.writer.writeUInt32(contentSize);
			this.writer.writeRawBytes(ARRAY_PADDING);
			this.writer.writeString(subtype);
			this.writer.writeInt8(0);
			this.writer.writeUInt32((value as any).length);
			this.writer.writeRawBytes(contentBytes);
		} else {
			this.writer.writeUInt32((value as Uint8Array).length);
			this.writer.writeRawBytes(ARRAY_PADDING);
			this.writer.writeString(subtype);
			this.writer.writeInt8(0);
			this.writer.writeRawBytes(value as Uint8Array);
		}
	}

	private writeObjectProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('ObjectProperty');
		const value = prop.value as string;
		this.writer.writeUInt32(value.length + 5);
		this.writer.writeRawBytes(OBJECT_PADDING);
		this.writer.writeString(value);
	}

	private writeSoftObjectProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('SoftObjectProperty');
		const value = prop.value as string;
		this.writer.writeUInt32(value.length + 5 + 4);
		this.writer.writeRawBytes(OBJECT_PADDING);
		this.writer.writeString(value);
		this.writer.writeRawBytes(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
	}

	private writeMulticastInlineDelegateProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('MulticastInlineDelegateProperty');
		const contentSize =
			MULTICAST_UNKNOWN.length +
			4 +
			(prop as any).objectName.length +
			1 +
			4 +
			(prop as any).functionName.length +
			1;

		this.writer.writeUInt32(contentSize);
		this.writer.writeRawBytes(MULTICAST_PADDING);
		this.writer.writeRawBytes(MULTICAST_UNKNOWN);
		this.writer.writeString((prop as any).objectName);
		this.writer.writeString((prop as any).functionName);
	}

	private writeMapProperty(prop: AnyPropertyData): void {
		this.writer.writeString(prop.name);
		this.writer.writeString('MapProperty');
		const keyType = (prop as any).keyType;
		const valueType = (prop as any).valueType;
		const value = prop.value as [unknown, unknown][];

		const contentWriter = new BinaryWriter();

		for (const [currentKey, currentValue] of value) {
			if (keyType === 'StructProperty') {
				contentWriter.writeRawBytes(currentKey as Uint8Array);
			} else if (keyType === 'IntProperty') {
				contentWriter.writeInt32(currentKey as number);
			} else if (keyType === 'StrProperty' || keyType === 'NameProperty') {
				contentWriter.writeString(currentKey as string);
			} else {
				throw new Error(`Key Type not implemented: ${keyType}`);
			}

			if (valueType === 'StructProperty') {
				for (const item of currentValue as GVASData[]) {
					const itemSerializer = new PropertySerializer(contentWriter);
					itemSerializer.serializeProperty(item);
				}
				const noneSerializer = new PropertySerializer(contentWriter);
				noneSerializer.writeNoneProperty();
			} else if (valueType === 'IntProperty') {
				contentWriter.writeInt32(currentValue as number);
			} else if (valueType === 'FloatProperty') {
				contentWriter.writeFloat32(currentValue as number);
			} else if (valueType === 'StrProperty' || valueType === 'EnumProperty') {
				contentWriter.writeString(currentValue as string);
			} else if (valueType === 'BoolProperty') {
				contentWriter.writeBoolean(currentValue as boolean);
			} else {
				throw new Error(`Value Type not implemented: ${valueType}`);
			}
		}

		const contentBytes = new Uint8Array(contentWriter.toBuffer());
		const contentSize = 4 + 4 + contentBytes.length;

		this.writer.writeUInt32(contentSize);
		this.writer.writeRawBytes(MAP_PADDING);
		this.writer.writeString(keyType);
		this.writer.writeString(valueType);
		this.writer.writeRawBytes(MAP_PADDING);
		this.writer.writeInt8(0);
		this.writer.writeUInt32(value.length);
		this.writer.writeRawBytes(contentBytes);
	}
}

export function parseGVAS(buffer: ArrayBuffer): GVASData[] {
	const reader = new BinaryReader(buffer);
	const parser = new PropertyParser(reader);

	const properties: GVASData[] = [];

	properties.push(parser.readHeader());

	while (!reader.hasFinished()) {
		const prop = parser.readProperty();
		if (prop) properties.push(prop);
	}

	return properties;
}

export function serializeGVAS(properties: GVASData[]): ArrayBuffer {
	const writer = new BinaryWriter();
	const serializer = new PropertySerializer(writer);

	let fileEndProp: GVASData | undefined;
	for (const prop of properties) {
		if (prop.type === PropertyType.FileEndProperty) {
			fileEndProp = prop;
			continue;
		}
		serializer.serializeProperty(prop);
	}
	if (fileEndProp) {
		serializer.serializeProperty(fileEndProp);
	}

	return writer.toBuffer();
}
