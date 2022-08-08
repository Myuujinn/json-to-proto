export interface IOneOf {
  oneof: string[];
  options?: { [k: string]: any };
}

export interface IType extends INamespace {
  oneofs?: { [k: string]: IOneOf };
  fields: { [k: string]: IField };
  extensions?: number[][];
  reserved?: number[][];
  group?: boolean;
  comment?: string | null;
}

export interface IMethod {
  type?: string;
  requestType: string;
  responseType: string;
  requestStream?: boolean;
  responseStream?: boolean;
  options?: { [k: string]: any };
  comment?: string | null;
  parsedOptions?: { [k: string]: any };
}

export interface IService extends INamespace {
  methods: { [k: string]: IMethod };
  comment?: string | null;
}

export interface IField {
  rule?: string;
  type: string;
  id: number;
  options?: { [k: string]: any };
  comment?: string | null;
}

export interface IMapField extends IField {
  keyType: string;
}

export interface IExtensionMapField extends IMapField {
  extend: string;
}

export interface IExtensionField extends IField {
  extend: string;
}

export interface IEnum {
  values: { [k: string]: number };
  comments?: { [k: string]: string | null };
  options?: { [k: string]: any };
}

export interface INamespace {
  options?: { [k: string]: any };
  nested?: { [k: string]: AnyNestedObject };
}

export type AnyExtensionField = IExtensionField | IExtensionMapField;

export type AnyNestedObject = IEnum | IType | IService | AnyExtensionField | INamespace;
