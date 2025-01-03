// contacts/$contactId.tsx で、contacts ページのリンクを追加する
// /contacts/1 や /contacts/2 のような動的なURLを持つページを作成する

import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import type { ContactRecord } from "../data";

// json レスポンスを作成するための関数をインポート
// Remix v3 ( = React Router v7) で非推奨
import { json } from "@remix-run/node";

import { getContact, updateContact } from "../data";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

// 引数として渡された params は、URL のパスパラメータを含むオブジェクト
// このファイルは $contactId という名前の動的ルートを持つため、そのパスを持つオブジェクトになる
// 例: /contacts/1 のとき、params には { contactId: "1" } が渡される
export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariant(params.contactId, "params.contactId is required");
	const contact = await getContact(params.contactId);
	if (!contact) {
		throw new Response("Not Found", { status: 404 });
	}
	return json(contact);
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
	// invariant で、params.contactId が存在することを確認する
	invariant(params.contactId, "params.contactId is required");

	// request.formData() で、フォームデータを取得する
	// このフォームデータには、フォームのinput要素のname属性とvalue属性が含まれる
	// ここではfavorite という名前のinput要素が含まれる
	const formData = await request.formData();

	// updateContact 関数を使って、contact を更新する
	return updateContact(params.contactId, {
		favorite: formData.get("favorite") === "true",
	});
};

export default function Contact() {
	const contact = useLoaderData<typeof loader>();

	return (
		<div id="contact">
			<div>
				<img
					alt={`${contact.first} ${contact.last} avatar`}
					key={contact.avatar}
					src={contact.avatar}
				/>
			</div>

			<div>
				<h1>
					{contact.first || contact.last ? (
						<>
							{contact.first} {contact.last}
						</>
					) : (
						<i>No Name</i>
					)}{" "}
					<Favorite contact={contact} />
				</h1>

				{contact.twitter ? (
					<p>
						<a
							href={`https://twitter.com/${contact.twitter}`}
						>
							{contact.twitter}
						</a>
					</p>
				) : null}

				{contact.notes ? <p>{contact.notes}</p> : null}

				<div>
					<Form action="edit">
						<button type="submit">Edit</button>
					</Form>

					<Form
						// action="destroy" のように相対パスを記述すると、現在表示中のURLを基準にして対象のURLへリクエストを送信する
						// この場合、contacts/1 のページでこのフォームを送信すると、contacts/1/destroy にリクエストが送信される
						// このURLを取り扱えるように、$contactId_.destroy.tsx を作成する
						action="destroy"
						method="post"
						onSubmit={(event) => {
							const response = confirm(
								"Please confirm you want to delete this record."
							);
							if (!response) {
								event.preventDefault();
							}
						}}
					>
						<button type="submit">Delete</button>
					</Form>
				</div>
			</div>
		</div>
	);
}

const Favorite: FunctionComponent<{
	contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
	// fetcher は、ページの更新をせずに(ナビゲーションを伴わずに)
	// データの更新を行う(actionやloader を呼び出す)ための関数
	const fetcher = useFetcher();

	const favorite = contact.favorite;

	return (
		// fetcher.Form は、fetcher を使ってデータを更新するためのフォームを作成する
		// このフォームは、通常のフォームと同じように使えるが、対象ページへの遷移を行わない
		<fetcher.Form method="post">
			<button
				aria-label={
					favorite ? "Remove from favorite" : "Add to favorite"
				}
				name="favorite"
				value={favorite ? "false" : "true"}
			>
				{favorite ? "★" : "☆"}
			</button>
		</fetcher.Form>
	);
}
