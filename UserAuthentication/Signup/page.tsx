// import React from 'react'
// import Signup from './Signup'


// const page = () => {
//   return (
//     <div>
//       <Signup></Signup>
    
//     </div>
//   )
// }

// export default page



"use client";
import dynamic from "next/dynamic"; 

const SignUp = dynamic(() => import("./Signup"), { ssr: false });

const SignUpPage: React.FC = () => {
  return (
    <div>
      <SignUp />
    </div>
  );
};

export default SignUpPage