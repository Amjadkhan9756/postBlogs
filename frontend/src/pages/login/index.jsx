import { useEffect } from "react";
import { useState } from "react";
import UserLayout from "@/layout/userlayout";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "./style.module.css";
import { useDispatch } from "react-redux";
import { loginUser, registerUser } from "@/config/redux/action/authaction";
import { emptyMessage } from "@/config/redux/reducer/authreducer";
function LoginComponent() {
    const dispatch= useDispatch();
    const router= useRouter();

    const authState= useSelector((state) => state.auth);

    const [name, setname]= useState("");
     const [username, setusername]= useState("");
      const [email, setemail]= useState("");
      const [password, setpassword]= useState("");
       const [isloggedMethod, setisloggedMethod]= useState(false);
      const [formError, setFormError] = useState("");

      const handleSubmit = (event) => {
          event.preventDefault();
          setFormError("");

          if (password.length < 6 || !/[A-Za-z]/.test(password)) {
              setFormError("Password must be at least 6 characters and include at least one letter.");
              return;
          }

          if (!isloggedMethod && (!name.trim() || !username.trim())) {
              setFormError("First name and username are required.");
              return;
          }

          if (isloggedMethod) {
              dispatch(loginUser({ email: email.trim(), password }));
          } else {
              dispatch(registerUser({ username: username.trim(), name: name.trim(), email: email.trim(), password }));
          }
      }

  


    useEffect(() => {
        if(authState.isloggedin){
            router.push("/dashboard");
        }

    },[authState.isloggedin]);



    useEffect(()=>{ 
        if(localStorage.getItem("token")){
            router.push("/dashboard");
        }
    },[]);
   useEffect(()=>{
    dispatch(emptyMessage());
   }, [isloggedMethod, dispatch]);
  

    return ( 
        <UserLayout>
            <div className={styles.container}>
            <div className={styles.cardContainer}>
                <div className={styles.cardContainer_left}>
                   <p className={styles.cardleft_heading}>{isloggedMethod? "Sign In" :"Sign Up"}</p> 
          <p style={{color:authState.isError ? "red":"green"}}>{authState.message}</p> 
          {formError && <p role="alert" style={{ color: "red" }}>{formError}</p>}
                <form className={styles.inputcontainers} onSubmit={handleSubmit}>
                    {!isloggedMethod && <div className={styles.inputRow}>
                        <input onChange={(e)=>setusername(e.target.value)} className={styles.inputField} type="text" placeholder="Username" aria-label="Username" required/>
                     <input onChange={(e)=>setname(e.target.value)} className={styles.inputField} type="text" placeholder="First name" aria-label="First name" required/>
                    </div>}
                   
                    <input onChange={(e)=>setemail(e.target.value)} className={styles.inputField} type="email" placeholder="Email" aria-label="Email" required/>
                    <input onChange={(e)=>setpassword(e.target.value)} className={styles.inputField} type="password" placeholder="Password (at least 6 characters)" aria-label="Password" minLength={6} required/>
                    <button className={styles.buttonWithOutline} type="submit" disabled={authState.isloading} style={{ border: "none", font: "inherit" }}>
                        <p className={styles.buttonWithOutline_text}>
                            {authState.isloading ? "Please wait..." : isloggedMethod ? "Sign In" : "Sign Up"}
                        </p>
                    </button>
                </form>
                
                </div>
                <div className={styles.cardContainer_right}>
                    {isloggedMethod ?<p>Don't have an account</p>:<p>Already have an account </p>}
                    <div onClick={()=>{setFormError(""); setisloggedMethod(!isloggedMethod);}}
                     className={styles.buttonWithOutline} 
                     style={{color:"black" , textAlign:"center", cursor:"pointer"}}>
                     <p className={styles.buttonWithOutline_text}>
                            {isloggedMethod? "Sign Up" :"Sign In"}
                        </p>
                    </div>
                </div>
            </div>
            </div>
 

        </UserLayout>
        
     );
}

export default LoginComponent;