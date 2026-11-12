import {clientServer, getApiErrorMessage} from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const loginUser= createAsyncThunk(
"user/login",
async(user, thunkAPI)=>{
    try{
        const response= await clientServer.post("/login",{
            email:user.email,
            password:user.password
        });
        if(response.data.token){
            localStorage.setItem("token",response.data.token);
        }
        else{
            return thunkAPI.rejectWithValue({message:"token not recived Here!"});

        }
        return thunkAPI.fulfillWithValue(response.data.token);


    }
    catch(err){
        return thunkAPI.rejectWithValue(getApiErrorMessage(err, "Login failed"));
    }
}



)









export const registerUser= createAsyncThunk("user/register",
    async(user, thunkAPI)=>{
        try{
            const response = await clientServer.post("/register", {
                username: user.username,
                name: user.name,
                email: user.email,
                password: user.password
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch (err) {
            const message = getApiErrorMessage(
                err,
                "Could not reach the API. Check that the backend is running and the API URL is correct."
            );
            return thunkAPI.rejectWithValue(message);
        }
    }
)


export const getAboutUser= createAsyncThunk("user/getAboutUser",
    async({token},thunkAPI)=>{
    try{ 

            const response= await clientServer.get("/get_user_update_profile",{
               params:{
                    token:token,
                }
            })
            console.log("checked fro ",response);
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(err){
            return thunkAPI.rejectWithValue(getApiErrorMessage(err, "Failed to fetch user data"));
        }
    }
)


export const getAllUser= createAsyncThunk("user/getAllUser",

    async(_,thunkAPI)=>{
        try{

            const response= await clientServer.get("/user/get_allusers");
            console.log("response in getAllUser action", response.data);
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(err){


            return thunkAPI.rejectWithValue(getApiErrorMessage(err, "Failed to fetch all users"));
        }
    }
)

export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async(user, thunkAPI)=>{
        try{

            const response = await clientServer.post("/user/send_connection_request",{
                token : user.token,
                connectionId:user.user_id

            });
            
        thunkAPI.dispatch(getConnectionRequest({token : user.token}));
        return thunkAPI.fulfillWithValue(response.data);

        }
        catch(err){
            return thunkAPI.rejectWithValue(getApiErrorMessage(err, "Failed to send the request"));
        }

    }


)


export const getConnectionRequest= createAsyncThunk(

    "user/getConnectionRequest",
    async(user, thunkAPI)=>{
        try{
                 const response = await clientServer.get("/user/get_connection_request", {

                    params:{
                        token: user.token,
                    }
                 });
                 console.log("699",response.data.connections)
                 return thunkAPI.fulfillWithValue(response.data.connections);


        }
        catch(err){
            return thunkAPI.rejectWithValue(getApiErrorMessage(err, "Unable to get connection requests"));

            
        }

    }
)

export const getMyConnectionsRequest= createAsyncThunk("user/getMyConnections",

    async(user, thunkAPI)=>{
        try{
            const response = await clientServer.get("/user/user_connection_request", {
                params:{ 
                    token: user.token,
                }
                
            });
            console.log("090",response.data.connection);
                        console.log("091",response.data.connection);

            return thunkAPI.fulfillWithValue(response.data.connection);
            

    
        }

        catch(err){
            return thunkAPI.rejectWithValue(getApiErrorMessage(err, "Unable to fetch your connections"));

        }




    }
)

export const acceptConnectionRequest= createAsyncThunk("user/accept_connection_request",


    async(user, thunkAPI)=>{

        try{

            const response = await clientServer.post("/user/accept_connection_request",{
               token: user.token,
               requestId:user.connectionId,
               action_type:user.action,

            }) 
            thunkAPI.dispatch(getConnectionRequest({token:user.token}));
            thunkAPI.dispatch(getMyConnectionsRequest({token:user.token}));
           return thunkAPI.fulfillWithValue(response.data);

        }
        catch(err){
            return thunkAPI.rejectWithValue(getApiErrorMessage(err, "Could not accept the request. Please try again."));
        }

    }
)