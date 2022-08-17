import { AnyNestedObject, IEnum, INamespace, IService, IType } from "./types";

let desc = "";

const writeLine = (
  text: string,
  options: { lineBreaks: number; indent?: number } = { lineBreaks: 1, indent: 0 },
) => {
  desc +=
    Array(options.indent ?? 0)
      .fill(" ")
      .join("") +
    text +
    Array(options.lineBreaks).fill("\n").join("");
};

const startFile = () => {
  desc = "";
  writeLine('syntax = "proto3";', { lineBreaks: 2 });
};

const parsePackageImports = (obj: AnyNestedObject, origin: string) => {
  if ("nested" in obj && obj.nested) {
    for (const [name, pack] of Object.entries(obj.nested)) {
      parsePackageImports(pack, `${origin}/${name.toLowerCase()}`);
    }
  } else {
    writeLine(`import "${origin}.proto";`, { lineBreaks: 2 });
  }
};

const writePackage = (name: string) => {
  writeLine(`package ${name};`, { lineBreaks: 2 });
};

const writeService = (name: string, service: IService) => {
  writeLine(`service ${name} {`);

  for (const [methodName, { requestType, responseType, responseStream }] of Object.entries(
    service.methods,
  )) {
    writeLine(
      `rpc ${methodName}(${requestType}) returns (${
        responseStream ? "stream " : ""
      }${responseType}) {}`,
      {
        lineBreaks: 1,
        indent: 4,
      },
    );
  }
  writeLine(`}`, { lineBreaks: 2 });
};

const writeMessage = (name: string, service: IType) => {
  writeLine(`message ${name} {`);

  for (const [fieldName, { type, id, rule }] of Object.entries(service.fields)) {
    writeLine(`${rule ? rule + " " : ""}${type} ${fieldName} = ${id};`, {
      lineBreaks: 1,
      indent: 4,
    });
  }
  writeLine(`}`, { lineBreaks: 2 });
};

const writeEnum = (name: string, enumValue: IEnum) => {
  writeLine(`enum ${name} {`);

  for (const [fieldName, id] of Object.entries(enumValue.values)) {
    writeLine(`${fieldName} = ${id};`, {
      lineBreaks: 1,
      indent: 4,
    });
  }
  writeLine(`}`, { lineBreaks: 2 });
};

const parse = (name: string, obj: AnyNestedObject) => {
  if ("nested" in obj && obj.nested) {
    if ("options" in obj && obj.options) {
      for (const [optionName, value] of Object.entries(obj.options)) {
        writeLine(`option ${optionName} = "${value}";`, { lineBreaks: 2 });
      }
    }
    for (const [propertyName, value] of Object.entries(obj.nested)) {
      parse(propertyName, value);
    }
  } else if ("methods" in obj && obj.methods) {
    writeService(name, obj);
  } else if ("fields" in obj && obj.fields) {
    writeMessage(name, obj);
  } else if ("values" in obj && obj.values) {
    writeEnum(name, obj);
  }
};

export const jsonToProto = (namespace: INamespace, packageToParse: string): string => {
  startFile();

  if (!namespace.nested) {
    throw new Error("Need an input from protobufjs toJSON function");
  }

  const packages = Object.entries(namespace.nested).sort((a, b) => {
    if (a[0] === packageToParse) {
      return 1;
    }
    if (b[0] === packageToParse) {
      return -1;
    }
    return 0;
  });

  for (const [name, pack] of packages) {
    if (name === packageToParse) {
      writePackage(name);
      parse(name, pack);
    } else {
      parsePackageImports(pack, name);
    }
  }

  return desc;
};
