// $contactId_.edit とすることで、自動ネストを防ぐ

import type {
	ActionFunctionArgs,
	LoaderFunctionArgs
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getContact, updateContact } from "../data";

// サーバーサイドでデータ取得を行う関数
export const loader = async ({
	params
}: LoaderFunctionArgs) => {
	invariant(params.contactId, "Missing contactId param");
	const contact = await getContact(params.contactId);
	if (!contact) {
		throw new Response("Not Found", { status: 404 });
	}
	return json({ contact });
};

// サーバーサイドでデータの更新を行う関数
export const action = async ({ params, request }: ActionFunctionArgs) => {
	invariant(params.contactId, "Missing contactId param");

	// リクエストから、送信されたリクエストボディ(fomData) を取得する
	const formData = await request.formData();

	// フォームデータをオブジェクトに変換する
	const updates = Object.fromEntries(formData);

	// フォームに入力された内容で、contact を更新する
	await updateContact(params.contactId, updates);

	// contact の詳細画面にリダイレクト
	return redirect(`/contacts/${params.contactId}`);
};

export default function EditContact() {
	const { contact } = useLoaderData<typeof loader>();

	return (
		<Form key={contact.id} id="contact-form" method="post">
			<p>
				<span>Name</span>
				<input
					aria-label="First name"
					defaultValue={contact.first}
					name="first"
					placeholder="First"
					type="text"
				/>
				<input
					aria-label="Last name"
					defaultValue={contact.last}
					name="last"
					placeholder="Last"
					type="text"
				/>
			</p>
			<label>
				<span>Twitter</span>
				<input
					defaultValue={contact.twitter}
					name="twitter"
					placeholder="@jack"
					type="text"
				/>
			</label>
			<label>
				<span>Avatar URL</span>
				<input
					aria-label="Avatar URL"
					defaultValue={contact.avatar}
					name="avatar"
					placeholder="https://example.com/avatar.jpg"
					type="text"
				/>
			</label>
			<label>
				<span>Notes</span>
				<textarea
					defaultValue={contact.notes}
					name="notes"
					rows={6}
				/>
			</label>
			<p>
				<button type="submit">Save</button>
				<button type="button">Cancel</button>
			</p>
		</Form>
	);
}
