import { MessageContext } from "@/contexts/message";
import UserContext from "@/contexts/user";
import { UserPreferenceDto } from "@/models/user/user";
import { userUpdatePreference } from "@/services/user";
import { PageContainer, ProCard, ProForm, ProFormDigit, ProFormRadio, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Button, Col, Result, Row, Space } from "antd";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

export default function Setting() {
  const nav = useNavigate();
  const user = useContext(UserContext);
  const message = useContext(MessageContext);
  return (
    <>
    <PageContainer
      title="传输设置"
      style={{width: '100%', alignSelf: 'center'}}
		>
      <div>
        {
          !user.logined ? (
            <Result
              status="warning"
              title="请先登录"
              // subTitle={errMessage}
              extra={[
                <Button type="primary" onClick={() => { nav("/login"); }}>
                  前往登录
                </Button>
              ]}
            />
          ) : (
            <ProCard>
              <ProForm<UserPreferenceDto>
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                submitter={{
                  render: (props, doms) => {
                    return (
                      <Row>
                        <Col span={14} offset={4}>
                          <Space>{doms}</Space>
                        </Col>
                      </Row>
                    )
                  },
                }}
                onFinish={async (values) => {
                  try
                  {
                    await userUpdatePreference(values);
                    message.success('提交成功');
                    user.userInfo!.preference = JSON.stringify(values);
                  }
                  catch (ex: any)
                  {
                    message.error(ex);
                  }
                }}
                params={{}}
                request={async () => {
                  return JSON.parse(user.userInfo?.preference!);
                }}
              >
                <ProFormDigit
                  width="sm"
                  name="concurrencyCount"
                  label="并行传输数量"
                  initialValue={4}
                  max={8}
                  min={1}
                />
                <ProFormSelect
                  options={[
                    {
                      value: 'overwrite',
                      label: '覆盖（会留下历史版本）',
                    },
                    {
                      value: 'rename',
                      label: '自动重命名',
                    },
                    {
                      value: 'ask',
                      label: '终止（手动处理冲突）',
                    },
                  ]}
                  initialValue="overwrite"
                  width="md"
                  name="conflictResolutionStrategy"
                  label="文件上传冲突策略"
                />
              </ProForm>
            </ProCard>
          )
        }
      </div>
    </PageContainer>
    </>
  )
}