import { createContext, useState, useContext } from 'react';

// create context
const UserContext = createContext();
const SessionContext = createContext();

export function UserProvider({children}) {
    const [globalUser, setGlobalUser] = useState ('friend');

    const onUserChange = (user_name) => {
        setGlobalUser((prev) => (user_name));
    };


    return (
        <UserContext.Provider value = {{globalUser, onUserChange}}>
            {children}
        </UserContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useProfile must be used within a UserProvider');
 
   }
   return context;
}