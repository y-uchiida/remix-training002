import {
  Form,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// ページのリンクを追加するために、links関数をエクスポートする
import type { LinksFunction } from "@remix-run/node";
// app.css のURL を取得するために、appStylesHref をインポートする
import appStylesHref from "./app.css";
// ページのリンクを追加するために、links()をエクスポートする
// エクスポートされたlinks() は、<Links /> コンポーネントにレンダリングされる
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: appStylesHref }];
}

// app/root.tsx はRoot Route で、
// UIとして最初にレンダリングされるコンポーネントになる。
// 通常はページのグローバルレイアウトが含まれる。
export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Links /> {/* links関数で追加したリンクをレンダリングする */}
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
            <ul>
              <li>
                <a href={`/contacts/1`}>Your Name</a>
              </li>
              <li>
                <a href={`/contacts/2`}>Your Friend</a>
              </li>
            </ul>
          </nav>
        </div>
        <div id="detail">
          {/* 子コンポーネントをレンダリングする位置をOutlet で指定する */}
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
