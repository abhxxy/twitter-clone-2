import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { VscAccount, VscHome, VscSignIn, VscSignOut } from "react-icons/vsc";

export function SideNav() {
  const session = useSession();
  const user = session.data?.user;

  return (
    <nav className="stick top-0 px-2 py-4">
      <ul className="top-0 flex flex-col items-start">
        <li>
          <Link href="/">
            <span className="inline-flex items-center gap-x-2 rounded-full px-3 py-2 transition-colors duration-200 ease-in-out hover:bg-gray-200">
              <VscHome size={30} />
              <span className="hidden md:inline">Home</span>
            </span>
          </Link>
        </li>

        {user != null && (
          <li>
            <Link href={`/profile/${user.id}`}>
              <span className="inline-flex items-center gap-x-2 rounded-full px-3 py-2 transition-colors duration-200 ease-in-out hover:bg-gray-200">
                <VscAccount size={30} />
                <span className="hidden md:inline">Profile</span>
              </span>
            </Link>
          </li>
        )}
        {user == null ? (
          <li>
            <button onClick={() => void signIn()}>
              <Link href="/">
                <span className="inline-flex items-center gap-x-2 rounded-full px-3 py-2 transition-colors duration-200 ease-in-out hover:bg-gray-200">
                  <VscSignIn size={30} />
                  <span className="hidden md:inline">LogIn</span>
                </span>
              </Link>
            </button>
          </li>
        ) : (
          <li>
            <button onClick={() => void signOut()}>
              <Link href="/">
                <span className="inline-flex items-center gap-x-2 rounded-full px-3 py-2 transition-colors duration-200 ease-in-out hover:bg-gray-200">
                  <VscSignOut size={30} />
                  <span className="hidden md:inline">LogOut</span>
                </span>
              </Link>{" "}
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
