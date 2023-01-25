import
{
	getType,
	Type,
	TypeKind
} from "tst-reflect";

test("getType<>() of tuple", () =>
{
	type MyT = [boolean, number, string];
	const typeT = getType<MyT>();

	type A = number[];
	const typeA = getType<A>();

	console.log("TYPE T");
	console.log(typeT);
	console.log("Kind", TypeKind[typeT.kind]);
	console.log("isLiteral", typeT.isLiteral());
	console.log("isObjectLiteral", typeT.isObjectLiteral());
	console.log("getTypeParameters", typeT.getTypeParameters());
	// console.log("TYPE A");
	// console.log(typeA)

	expect(typeT.isTuple()).toBe(true);
	expect(typeT.getTypeParameters()).toHaveLength(3);
});