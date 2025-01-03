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
} from "@remix-run/react";

// ページのリンクを追加するために、links関数をエクスポートする
import type { LinksFunction } from "@remix-run/node";
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

export const loader = async () => {
  const contacts = await getContacts();
  return json(contacts);
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
  const contacts = useLoaderData<typeof loader>();

  // navigation() で、ページ遷移のステータス(idle, loading, submitting) を取得する
  const navigation = useNavigation();

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
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={true} />
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
          className={
            navigation.state === "loading" ? "loading" : ""
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
