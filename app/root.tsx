import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";

import type {
  LinksFunction, // ページのリンクを追加するために、links関数をエクスポートする
  LoaderFunctionArgs, // loader 関数の引数を定義する
} from "@remix-run/node";

// app.css のURL を取得するために、appStylesHref をインポートする
import appStylesHref from "./app.css?url";
// ページのリンクを追加するために、links()をエクスポートする
// エクスポートされたlinks() は、<Links /> コンポーネントにレンダリングされる
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: appStylesHref }];
}

// json レスポンスを作成するための関数をインポート
// Remix v3 ( = React Router v7) で非推奨
import { json, redirect } from "@remix-run/node";

import { createEmptyContact, getContacts } from "./data";
import { useEffect } from "react";

export const loader = async ({
  request
}: LoaderFunctionArgs) => {
  // URL からクエリパラメータを取得する
  const url = new URL(request.url);
  // `q` は検索フォームのinput要素のname属性
  const q = url.searchParams.get("q");
  // 検索フォームに入力された値を使って、contacts を取得
  const contacts = await getContacts(q);

  // contacts と q を返す
  return json({ contacts, q });
};

// POST /contacts にアクセスしたときに、新しい空のcontactを作成する
// Remix は、action() をサーバーサイドで実行したのち、その結果をクライアントに返す
// ここでは、新しい空のcontact を作成し、その編集画面へリダイレクトしている
export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

// app/root.tsx はRoot Route で、
// UIとして最初にレンダリングされるコンポーネントになる。
// 通常はページのグローバルレイアウトが含まれる。
export default function App() {
  // loader で返されたデータを取得する
  // contacts は、検索フォームに入力された値を使って取得したcontacts
  // q は検索フォームに入力された値(検索キーワード)
  const { contacts, q } = useLoaderData<typeof loader>();

  // navigation() で、ページ遷移のステータス(idle, loading, submitting) を取得する
  const navigation = useNavigation();

  // submit() で、フォームの送信を行う
  const submit = useSubmit();

  // 検索中かどうかを判定する
  // navigation.location は、ページ遷移中(データロード中)はその遷移先のURLを持つ
  // 遷移先のURL のクエリパラメータに`q` 含まれている場合、検索中と判定する
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      // URL のクエリパラメータと検索フォームの入力値を同期させる
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links />{/* links関数で追加したリンクをレンダリングする */}
        <Meta />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id="search-form"
              role="search"
              // フォームの内容が更新されたとき、submit() でフォームの送信を行う
              // submit() は、Remix が用意しているフォームの送信を行うためのフック
              onChange={(e) => {
                submit(e.currentTarget)
              }}
            >
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                defaultValue={q || ""}
                className={searching ? "loading" : ""}
              />
              <div
                aria-hidden
                hidden={!searching}
                id="search-spinner"
              />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    {/* NavLink で、to が指すURLを表示中(isActive),ロード中(isPending) を判定できる */}
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive
                          ? "active"
                          : isPending
                            ? "pending"
                            : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          // navigation.status
          // idle: ページ遷移中でない
          // loading: ページ遷移中
          // submitting: フォームが送信されている
          // searching: 検索中 (遷移先ページにq が含まれているとき)
          className={
            navigation.state === "loading" && !searching
              ? "loading"
              : ""
          }
          id="detail"
        >
          {/* 子コンポーネントをレンダリングする位置をOutlet で指定する */}
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
