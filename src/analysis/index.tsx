import { FC, useEffect, useState } from 'react';
import { Typography } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import Pie from '@ant-design/charts/es/pie';

const Analysis: FC = () => {
  const db: any = window.roomManagementSystemDB;
  const [roomData, setRoomData] = useState<any[]>([]);
  const stillEmptyNumber = roomData.filter(room => !room.stillEmpty).length;

  const fetchRoomData = async () => {
    setRoomData(await db.room.toArray());
  };

  useEffect(() => {
    fetchRoomData();
    // eslint-disable-next-line
  }, []);

  const data = [
    {
      type: 'Còn trống',
      value: stillEmptyNumber
    },
    {
      type: 'Có khách ở',
      value: roomData.length - stillEmptyNumber
    }
  ];
  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    label: {
      type: 'inner',
      offset: '-30%',
      content: function content(_ref: any) {
        var percent = _ref.percent;
        return ''.concat((percent * 100).toFixed(0), '%');
      },
      style: {
        fontSize: 14,
        textAlign: 'center'
      }
    },
    interactions: [{ type: 'element-active' }]
  };

  return (
    <PageContainer header={{ title: 'Thống kê' }}>
      <ProCard ghost gutter={[8, 0]}>
        <ProCard colSpan={24}>
          <Pie {...config} />

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Typography.Title level={4}>Phòng còn trống</Typography.Title>
          </div>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default Analysis;
