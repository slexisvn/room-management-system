import { FC, useEffect, useState } from 'react';
import { Typography, DatePicker } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import moment from 'moment';
import Pie from '@ant-design/charts/es/pie';
import Line from '@ant-design/charts/es/line';

type ICustomRoom = IRoom & { kindOfRoom: IKindOfRoom };

type ICustomAgreements = (IAgreement & { room: ICustomRoom })[];

const Analysis: FC = () => {
  const db = window.roomManagementSystemDB;
  const [roomData, setRoomData] = useState<IRoom[]>([]);
  const [agreementData, setAgreementData] = useState<ICustomAgreements>([]);
  const [monthValue, setMonthValue] = useState<number[]>([]);
  const stillEmptyNumber = roomData.filter(room => !room.stillEmpty).length;

  const fetchRoomData = async () => {
    setRoomData(await db!.room!.toArray());
  };

  const fetchAgreementData = async () => {
    const agreements = (await db!.agreement!.toArray()) as ICustomAgreements;
    await Promise.all(
      agreements.map(async agreement => {
        [agreement.room] = (await Promise.all([db!.room!.get(agreement.roomId)])) as ICustomRoom[];

        [agreement.room!.kindOfRoom] = (await Promise.all([
          db!.kindOfRoom!.get(agreement.room.kindOfRoomId)
        ])) as IKindOfRoom[];
      })
    );
    setAgreementData(agreements);
  };

  useEffect(() => {
    fetchRoomData();
    fetchAgreementData();
    // eslint-disable-next-line
  }, []);

  const pieData = [
    {
      type: 'Còn trống',
      value: stillEmptyNumber
    },
    {
      type: 'Có khách ở',
      value: roomData.length - stillEmptyNumber
    }
  ];
  const pieConfig = {
    appendPadding: 10,
    data: pieData,
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

  const filteredAgreementData = agreementData.filter(
    agreement =>
      moment(monthValue[0]).isSameOrBefore(agreement.date[0]) ||
      moment(monthValue[1]).isSameOrAfter(agreement.date[0])
  );

  const lineData =
    monthValue.length > 0
      ? Array.from({
          length: moment(monthValue[1]).diff(moment(monthValue[0]), 'months') + 1
        }).map((_, index) => ({
          month: moment(monthValue[0]).add(index, 'month').format('MM/YYYY'),
          value: filteredAgreementData
            .filter(agreement =>
              moment(monthValue[0]).add(index, 'month').isSameOrBefore(agreement.date[1])
            )
            .map(agreement => agreement.room.kindOfRoom.price)
            .reduce((a, b) => a + b, 0)
        }))
      : [];

  const lineConfig = {
    data: lineData,
    xField: 'month',
    yField: 'value',
    label: {},
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2
      }
    },
    tooltip: { showMarkers: false },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#000',
          fill: 'red'
        }
      }
    },
    interactions: [{ type: 'marker-active' }]
  };

  return (
    <PageContainer header={{ title: 'Thống kê' }}>
      <ProCard ghost gutter={[24, 0]}>
        <ProCard colSpan={8}>
          <Pie {...pieConfig} />

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Typography.Title level={4}>Phòng còn trống</Typography.Title>
          </div>
        </ProCard>

        <ProCard colSpan={16}>
          <DatePicker.RangePicker
            picker='month'
            style={{ width: 400, marginBottom: 24 }}
            format={['MM/YYYY', 'MM/YYYY']}
            ranges={{
              '1 tháng': [moment().startOf('months'), moment().endOf('months')],
              '3 tháng': [moment().startOf('months'), moment().add(3, 'months').endOf('months')],
              '6 tháng': [moment().startOf('months'), moment().add(6, 'months').endOf('months')],
              '1 năm': [moment().startOf('months'), moment().add(12, 'months').endOf('months')]
            }}
            onChange={value => {
              setMonthValue([value![0]!.valueOf(), value![1]!.valueOf()]);
            }}
          />

          <Line {...lineConfig} />

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Typography.Title level={4}>Doanh thu</Typography.Title>
          </div>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default Analysis;
