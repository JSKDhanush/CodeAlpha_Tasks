// import SignIn from './Signin';
// import { GoogleOAuthProvider } from '@react-oauth/google'; 
// export default function Home() {
  
//   return <SignIn></SignIn>;
// }

"use client";
import dynamic from "next/dynamic"; 

const SignIn = dynamic(() => import("./Signin"), { ssr: false });

const SignInPage: React.FC = () => {
  return (
    <div>
      <SignIn />
    </div>
  );
};

export default SignInPage