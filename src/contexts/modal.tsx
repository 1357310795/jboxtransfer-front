import { Modal } from 'antd';
import { HookAPI } from 'antd/es/modal/useModal';
import { createContext } from 'react';

export const ModalContext = createContext<HookAPI>({} as HookAPI);

export const ModalContextProvider = (props: any) => {
    const [modal, contextHolder] = Modal.useModal();

    const contextValue = {
        ...modal
    }

    return (
        <ModalContext.Provider value={contextValue}>
            {contextHolder}
            {props.children}
        </ModalContext.Provider>
    );
};