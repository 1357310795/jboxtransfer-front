import { createContext, useContext, useEffect, useState } from 'react';
import { UserInfoDto } from '@/models/user/user';
import { NotificationContext } from '@/contexts/notification';
import { userGetInfo, userLogout } from '@/services/user';
import { useNavigate } from 'react-router-dom';


interface UserContextType {
  logined: boolean;
  setLogined: (isLogined: boolean) => void;
  userInfo: UserInfoDto | undefined;
  onLogout: () => void;
  refresh: () => void;
}

const UserContext = createContext<UserContextType>({
  logined: false,
  setLogined: () => {},
  userInfo: undefined,
  onLogout: () => {},
  refresh: () => {},
});

export const UserContextProvider = (props : any) => {
  const [logined, setLogined] = useState<boolean>(false);
  const [softRefresh, setSoftRefresh] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfoDto | undefined>(undefined);
  
  const noti = useContext(NotificationContext);

  const onLogout = () => {
    userLogout()
      .then((data)=>{
        setLogined(false);
        location.reload();
      })
      .catch((err)=>{
        setLogined(false);
        document.cookie = "";
        location.reload();
      });
  }

  const refresh = () => {
    setSoftRefresh(true);
  }

  const contextValue: UserContextType = {
    logined: logined,
    setLogined: setLogined,
    userInfo: userInfo,
    onLogout: onLogout,
    refresh: refresh,
  }

  useEffect(() => {
    if (window.location.pathname == "/" || 
        window.location.pathname == "/login" ||
        window.location.pathname == "")
      return;
    if (softRefresh == true)
    {
      setSoftRefresh(false);
      return;
    }
    userGetInfo()
      .then((data)=>{
        setLogined(true);
        setUserInfo(data);
      })
      .catch((err)=>{
        if (err == "NotLoginedError"){
          setLogined(false);
          // if (window.location.pathname != "/signin")
          //   window.location.replace("/signin");
        }
        else {
          setLogined(false);
          noti.error(err);
        }
      })
  }, [softRefresh, logined]);

  return (
    <UserContext.Provider value={contextValue}>
      {props.children}
    </UserContext.Provider>
  )
}

export default UserContext