import "../styles/globals.css";
import Link from "next/link";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const { pathname } = useRouter();
  const isActive = (path) =>
    pathname === path ? "text-gray-500" : "text-pink-500";

  return (
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl front-bold">Metaverse Marketplace</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className={`mr-4 ${isActive("/")}`}>Home</a>
          </Link>
          <Link href="/create-item">
            <a className={`mr-6 ${isActive("/create-item")}`}>
              Sell Digit Asset
            </a>
          </Link>
          <Link href="/my-assets">
            <a className={`mr-6 ${isActive("/my-assets")}`}>
              My Digital Assets
            </a>
          </Link>
          <Link href="/create-dashboard">
            <a className={`mr-6 ${isActive("/create-dashboard")}`}>
              Create Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
