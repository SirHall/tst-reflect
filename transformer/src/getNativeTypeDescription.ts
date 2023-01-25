import { TypeKind }              from "tst-reflect";
import * as ts                   from "typescript";
import { Context }               from "./contexts/Context";
import { TypeDescriptionResult } from "./declarations";
import { getTypeCall }           from "./getTypeCall";
import {
	getTypeId,
	isArrayType,
	isPromiseType
} from "./helpers";

/**
 * Questioning if this could be better/is pointless
 *
 * @param {string} name
 * @returns {string}
 */
function getNativeTypeCtorName(name: string): string | undefined
{
	if (!name)
	{
		return undefined;
	}

	switch (name.toLowerCase())
	{
		case "bigint":
			return "BigInt";
		case "symbol":
			return "Symbol";
		case "string":
			return "String";
		case "number":
			return "Number";
		case "boolean":
			return "Boolean";
		case "array":
			return "Array";
	}

	return undefined;
}

function getNativeTypeCtor(name: string): ts.FunctionExpression | undefined
{
	const nativeCtorType = getNativeTypeCtorName(name);
	if (nativeCtorType === undefined)
	{
		return undefined;
	}

	// function() { return Promise.resolve($nativeCtorType) }
	return ts.factory.createFunctionExpression(
		undefined,
		undefined,
		undefined,
		undefined,
		[],
		undefined,
		ts.factory.createBlock([
			ts.factory.createReturnStatement(
				ts.factory.createCallExpression(
					ts.factory.createPropertyAccessExpression(
						ts.factory.createIdentifier("Promise"),
						ts.factory.createIdentifier("resolve")
					),
					undefined,
					[
						ts.factory.createIdentifier(nativeCtorType)
					]
				)
			)
		], true)
	);
}

/**
 * Check that Type is native type (string, number, boolean, ...)
 * @param type
 * @param context
 */
export function getNativeTypeDescription(type: ts.Type, context: Context): TypeDescriptionResult
{
	if ((type as any)["intrinsicName"] !== undefined)
	{
		return {
			ok: true,
			typeDescription: {
				n: (type as any).intrinsicName,
				k: TypeKind.Native,
				id: getTypeId(type, context.typeChecker),
				ctor: getNativeTypeCtor((type as any).intrinsicName),
				ctors: undefined,
				decs: undefined,
				props: undefined
			}
		};
	}

	if (isArrayType(type))
	{
		const typeArguments = context.typeChecker.getTypeArguments(type);

		if (typeArguments.length == 1)
		{
			return {
				ok: true,
				typeDescription: {
					n: "Array",
					fn: "Array#" + getTypeId(type, context.typeChecker),
					isg: true,
					gtd: type.target === type 
						? undefined 
						: getTypeCall(type.target, undefined, context),
					k: TypeKind.Native,
					id: getTypeId(type, context.typeChecker),
					ctor: getNativeTypeCtor("Array"),
					args: [getTypeCall(typeArguments[0], undefined, context)]
				}
			};
		}
	}

	if (isPromiseType(type))
	{
		const typeArguments = context.typeChecker.getTypeArguments(type);

		if (typeArguments.length == 1)
		{
			return {
				ok: true,
				typeDescription: {
					n: "Promise",
					fn: "Promise#" + getTypeId(type, context.typeChecker),
					isg: true,
					gtd: type.target === type
						? undefined
						: getTypeCall(type.target, undefined, context),
					k: TypeKind.Native,
					id: getTypeId(type, context.typeChecker),
					ctor: getNativeTypeCtor("Promise"),
					args: [getTypeCall(typeArguments[0], undefined, context)]
				}
			};
		}
	}

	return {
		ok: false
	};
}
