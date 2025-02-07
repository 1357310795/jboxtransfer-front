import { Card, Space, Typography } from "antd";

export interface FeatureCardProps {
  icon: string;
  title: string;
  content: string;
}

export default function FeatureCard(props: FeatureCardProps) {
  return (
    <Card 
      style={{
        height: '100%', 
      }}
      styles={{body: {padding: '8px 20px 20px 20px'}}}
    >
      <Space direction="vertical" align='start' size={12}>
        <Card
          style={{
            border: 'none',
            height: '48px',
            width: '48px',
            backgroundColor: 'var(--ant-color-bg-layout)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '24px',
          }}
          styles={{body: {padding: '0'}}}
        >
          {props.icon}
        </Card>
        <Typography.Title level={4}>
          {props.title}
        </Typography.Title>
        <Typography.Text color="">
          {props.content}
        </Typography.Text>
      </Space>
    </Card>
  )
}