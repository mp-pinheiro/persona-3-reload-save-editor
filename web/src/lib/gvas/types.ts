export enum PropertyType {
	HeaderProperty = 'HeaderProperty',
	NoneProperty = 'NoneProperty',
	BoolProperty = 'BoolProperty',
	IntProperty = 'IntProperty',
	Int8Property = 'Int8Property',
	Int64Property = 'Int64Property',
	UInt32Property = 'UInt32Property',
	UInt16Property = 'UInt16Property',
	FloatProperty = 'FloatProperty',
	EnumProperty = 'EnumProperty',
	StructProperty = 'StructProperty',
	ByteProperty = 'ByteProperty',
	StrProperty = 'StrProperty',
	NameProperty = 'NameProperty',
	SetProperty = 'SetProperty',
	ArrayProperty = 'ArrayProperty',
	ObjectProperty = 'ObjectProperty',
	SoftObjectProperty = 'SoftObjectProperty',
	MulticastInlineDelegateProperty = 'MulticastInlineDelegateProperty',
	MapProperty = 'MapProperty',
	FileEndProperty = 'FileEndProperty'
}

export interface GVASProperty {
	type: PropertyType | string;
}

export interface HeaderPropertyData extends GVASProperty {
	type: PropertyType.HeaderProperty;
	saveGameVersion: number;
	packageVersion: number;
	engineVersion: string;
	engineBuild: number;
	engineBranch: string;
	customVersionFormat: number;
	customVersions: Array<{ guid: Uint8Array; version: number }>;
	saveGameClassName: string;
}

export interface BoolPropertyData extends GVASProperty {
	type: PropertyType.BoolProperty;
	name: string;
	value: boolean;
}

export interface IntPropertyData extends GVASProperty {
	type: PropertyType.IntProperty;
	name: string;
	paddingStatic: Uint8Array;
	padding: Uint8Array;
	value: number;
}

export interface Int8PropertyData extends GVASProperty {
	type: PropertyType.Int8Property;
	name: string;
	paddingStatic: Uint8Array;
	padding: Uint8Array;
	value: number;
}

export interface Int64PropertyData extends GVASProperty {
	type: PropertyType.Int64Property;
	name: string;
	value: bigint;
}

export interface UInt32PropertyData extends GVASProperty {
	type: PropertyType.UInt32Property;
	name: string;
	paddingStatic: Uint8Array;
	padding: Uint8Array;
	value: number;
}

export interface UInt16PropertyData extends GVASProperty {
	type: PropertyType.UInt16Property;
	name: string;
	paddingStatic: Uint8Array;
	padding: Uint8Array;
	value: number;
}

export interface FloatPropertyData extends GVASProperty {
	type: PropertyType.FloatProperty;
	name: string;
	value: number;
}

export interface StrPropertyData extends GVASProperty {
	type: PropertyType.StrProperty;
	name: string;
	unknown: Uint8Array;
	value: string;
	wide?: boolean;
}

export interface NamePropertyData extends GVASProperty {
	type: PropertyType.NameProperty;
	name: string;
	unknown: Uint8Array;
	value: string;
}

export interface EnumPropertyData extends GVASProperty {
	type: PropertyType.EnumProperty;
	name: string;
	enum: string;
	value: string;
}

export interface StructPropertyData extends GVASProperty {
	type: PropertyType.StructProperty;
	name: string;
	subtype: string;
	value: Date | Uint8Array | GVASProperty[];
}

export interface BytePropertyData extends GVASProperty {
	type: PropertyType.ByteProperty;
	name: string;
	subtype: string;
	genericType?: string;
	value: number | Uint8Array[] | GVASProperty[][];
}

export interface ArrayPropertyData extends GVASProperty {
	type: PropertyType.ArrayProperty;
	name: string;
	subtype: string;
	genericType?: string;
	value: (string | Uint8Array | GVASProperty[])[];
}

export interface SetPropertyData extends GVASProperty {
	type: PropertyType.SetProperty;
	name: string;
	subtype: string;
	value: (string | Uint8Array | GVASProperty[])[];
}

export interface ObjectPropertyData extends GVASProperty {
	type: PropertyType.ObjectProperty;
	name: string;
	value: string;
}

export interface SoftObjectPropertyData extends GVASProperty {
	type: PropertyType.SoftObjectProperty;
	name: string;
	value: string;
}

export interface MulticastInlineDelegatePropertyData extends GVASProperty {
	type: PropertyType.MulticastInlineDelegateProperty;
	name: string;
	objectName: string;
	functionName: string;
}

export interface MapPropertyData extends GVASProperty {
	type: PropertyType.MapProperty;
	name: string;
	keyType: string;
	valueType: string;
	value: [unknown, unknown][];
}

export type AnyPropertyData =
	| HeaderPropertyData
	| BoolPropertyData
	| IntPropertyData
	| Int8PropertyData
	| Int64PropertyData
	| UInt32PropertyData
	| UInt16PropertyData
	| FloatPropertyData
	| StrPropertyData
	| NamePropertyData
	| EnumPropertyData
	| StructPropertyData
	| BytePropertyData
	| ArrayPropertyData
	| SetPropertyData
	| ObjectPropertyData
	| SoftObjectPropertyData
	| MulticastInlineDelegatePropertyData
	| MapPropertyData;

export type GVASData = HeaderPropertyData | AnyPropertyData | { type: 'FileEndProperty' };
