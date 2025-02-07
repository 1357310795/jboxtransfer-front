import { notification } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import { createContext } from 'react';

export const NotificationContext = createContext<NotificationInstance>({} as NotificationInstance);

export const NotificationContextProvider = (props: any) => {
    const [api, contextHolder] = notification.useNotification();

    const contextValue = {
        ...api
    }

    return (
        <NotificationContext.Provider value={contextValue}>
            {contextHolder}
            {props.children}
        </NotificationContext.Provider>
    );
};