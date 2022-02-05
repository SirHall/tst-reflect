import { Type }              from "../reflect";
import { MetadataStore }     from "./MetadataStore";
import { MetadataStoreBase } from "./MetadataStoreBase";

let store: InlineMetadataStore | null = null;

export class InlineMetadataStore extends MetadataStoreBase
{
	private _store: { [p: number]: Type } = {};

	public static initiate(): MetadataStore
	{
		if (store)
		{
			return store;
		}

		store = new InlineMetadataStore();

		(Type as any)._setStore(store);

		return store;
	}

	public static get(): MetadataStore
	{
		return store || this.initiate();
	}

	get store(): { [p: number]: Type }
	{
		return this._store;
	}

	get(id: number): Type | undefined
	{
		return this._store[id] ?? undefined;
	}

	getLazy(id: number): () => (Type | undefined)
	{
		return function () {
			return InlineMetadataStore.get().get(id) ?? undefined;
		};
	}

	set(id: number, description: any): Type
	{
		const type = this.wrap(description);

		this._store[id] = type;

		return type;
	}
}