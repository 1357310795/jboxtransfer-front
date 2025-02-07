import { Flex, Spin } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
    const nav = useNavigate();
    useEffect(()=>{
        nav("/main/start")
    }, []);
    return (
        <Flex align="center" justify="center" style={{width: '100vw', height: '100vh'}}>
            <Spin tip="Loading" size="large">
            </Spin>
        </Flex>
    )
}