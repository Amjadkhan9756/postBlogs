
import UserLayout from "@/layout/userlayout";
import DashboardLayout from "@/layout/dasboardLayout";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { getAllUser } from "@/config/redux/action/authaction";
import { getImageUrl } from "@/config/index";
import Avatar from "@/Component/Avatar";
import VerifiedBadge from "@/Component/VerifiedBadge";
import styles from "./style.module.css";
import { useRouter } from "next/router";


function Discover() {
    const dispatch = useDispatch();
    const authState= useSelector((state) => state.auth);
    const router= useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    useEffect(() => {
         if(!authState.all_profiles_fetched){
            dispatch(getAllUser());    
        }},[]);

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchingUsers = normalizedSearch
        ? authState.all_profiles.filter(({ userId }) => {
            if (!userId) return false;
            return [userId.name, userId.username]
                .some((value) => value?.toLowerCase().includes(normalizedSearch));
        })
        : [];

        
    return ( 

        <UserLayout>
            <DashboardLayout>
        <div className={styles.alluserProfile}>

            <h1>Discover</h1>
            <input
              className={styles.searchInput}
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or username"
              aria-label="Search users by name or username"
            />
            {!normalizedSearch ? (
              <p className={styles.searchHint}>Type a name or username to find people.</p>
            ) : authState.all_profiles_fetched && matchingUsers.length === 0 ? (
              <p className={styles.searchHint}>No users found.</p>
            ) : matchingUsers.map((users)=>{
                const profileUser = users.userId;

                return(
                
                    <div  onClick={()=>{router.push(`/view_profile?username=${profileUser.username}`)}} className={styles.userCard} key={users._id}>
                    <Avatar
                      src={profileUser?.profilePicture}
                      name={profileUser?.name}
                      className={styles.discoverAvatar}
                      initialClassName={styles.discoverAvatarInitials}
                    />
                   <div className="">

                     <h3 className={styles.userName} style={{ display: "inline-flex", alignItems: "center" }}>
                      {profileUser.name}
                      <VerifiedBadge verified={profileUser.verified} size={16} />
                    </h3>
                    <p style={{color:"gray"}} className={styles.userName}>{profileUser.username}</p>
                   </div>
                   
                    <hr />


                    </div>
                )
            })}
        
        </div>
        </DashboardLayout>
    
    </UserLayout> 
);
}

export default Discover;