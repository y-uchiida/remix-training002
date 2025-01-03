import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteContact } from "../data";

// サーバーサイドでデータの更新を行う関数
export const action = async ({
	params,
}: ActionFunctionArgs) => {
	invariant(params.contactId, "Missing contactId param");
	await deleteContact(params.contactId);
	return redirect("/");
};
