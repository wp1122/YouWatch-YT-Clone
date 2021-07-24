import React, { useContext, useEffect, useState } from 'react'
import { auth } from "../firebase"
import { database } from '../firebase'


const AuthContext = React.createContext()

export function useAuth() {
    return (
        useContext(AuthContext)
    )
}
export function AuthProvider({children}){
    const [currentUser, setCurrentUser] = useState()
    const [loading, setLoading] = useState(true)
    const [currentUserData, setCurrentUserData] = useState()
    const [myVideos, setMyVideos] = useState()
    function signup(email, password){
        return (auth.createUserWithEmailAndPassword(email, password))
    }
    function login(email, password){
        return(auth.signInWithEmailAndPassword(email, password))
    }
    function signout(){
        setCurrentUser(null)
        return(auth.signOut())
    }
    function resetPassword(email){
        return auth.sendPasswordResetEmail(email)
    }
    function updatepassword(password){
        return (currentUser.updatePassword(password))
    }
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })
        return unsubscribe;
    }, [])
    useEffect(() => {
        if(currentUser){
            database.users.doc(currentUser.uid.toString()).get().then((doc) => {
                if(doc.exists){
                    setCurrentUserData(doc.data())
                }
            })
        }
    })       
   useEffect(() => {
       if(currentUser){
        database.videos.where("UserID","==",currentUser.uid.toString()).get().then((querySnapshot) => {
            setMyVideos(querySnapshot.docs.map((doc) => doc.data()));
        })
       }
   })
    const value = {
        signup,
        currentUser,
        signout,
        resetPassword,
        login,
        currentUserData,
        updatepassword,
        myVideos
    }
    return(
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}