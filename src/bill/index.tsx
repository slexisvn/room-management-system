import { FC, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
  Tooltip,
  DatePicker,
  Select
} from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';

const BillPage: FC = () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [rowData, setRowData] = useState<any[]>([]);
  const [edit, setEdit] = useState('');
  const [form] = Form.useForm();
  const [foreignKey, setForeignKey] = useState<any>({
    room: [],
    unitPrice: []
  });
  const db: any = window.roomManagementSystemDB;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND'
  });

  const fetchData = async () => {
    setRowData(await db.bill.toArray());
  };

  const fetchForeignKeyData = async () => {
    const room = await db.room.toArray();
    const unitPrice = await db.unitPrice.toArray();
    setForeignKey({
      room,
      unitPrice
    });
  };

  useEffect(() => {
    fetchData();
    fetchForeignKeyData();
    // eslint-disable-next-line
  }, []);

  const handleEdit = ({ date, ...rest }: any) => {
    setEdit(rest.id);
    setVisibleModal(true);
    form.setFieldsValue({
      date: moment(date),
      ...rest
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(async ({ date, ...rest }) => {
      const value = { date: date.valueOf(), ...rest };
      const data: any[] = await db.bill.where('code').equals(value.code).toArray();

      if (data.filter(({ id }) => (edit ? edit !== id : id)).length > 0) {
        message.error(`Hóa đơn ${value.code} đã tồn tại!`);
        return;
      }

      if (edit) {
        db.bill
          .update(edit, { ...value, formatDate: moment(value.date).format('MM/YYYY') })
          .then((updated: boolean) => {
            if (updated) {
              message.success('Cập nhật thành công!');
              setVisibleModal(false);
              setEdit('');
              form.resetFields();
              fetchData();
            } else {
              message.error('Cập nhật thất bại!');
            }
          });
        return;
      }

      db.bill
        .add({
          id: uuidv4(),
          formatDate: moment(value.date).format('MM/YYYY'),
          ...value
        })
        .then(() => {
          message.success('Tạo thành công!');
          setVisibleModal(false);
          form.resetFields();
          fetchData();
        });
    });
  };

  const handleModalCancel = () => {
    setVisibleModal(false);
    setEdit('');
    form.resetFields();
  };

  const handleDeleteData = (data: any) => {
    Modal.warning({
      title: `Bạn có muốn xóa hóa đơn ${data.code}?`,
      onOk: () => {
        db.bill
          .where('code')
          .equals(data.code)
          .delete()
          .then(() => {
            message.success(`Xóa thành công!`);
            fetchData();
          });
      }
    });
  };

  return (
    <>
      <PageContainer
        extra={[
          <Button type='primary' onClick={() => setVisibleModal(true)}>
            Thêm mới
          </Button>
        ]}
        header={{ title: 'Quản lý hóa đơn' }}
      >
        <ProCard style={{ height: window.innerHeight - 168 }} className='ag-theme-alpine'>
          <AgGridReact
            animateRows
            defaultColDef={{ floatingFilter: true, sortable: true, filter: true, resizable: true }}
            groupMultiAutoColumn
            enableRangeSelection
            columnDefs={[
              { headerName: 'Thời gian', field: 'formatDate', rowGroup: true, hide: true },
              { headerName: 'Mã', field: 'code' },
              {
                headerName: 'Phòng',
                field: 'room'
              },
              { headerName: 'Số lượng điện tiêu thụ', field: 'amountOfElectricity' },
              { headerName: 'Số lượng nước tiêu thụ', field: 'amountOfWater' },
              { headerName: 'Số lượng xe', field: 'numberOfVehicles' },
              {
                headerName: 'Tiền điện',
                field: 'electricityBill'
              },
              {
                headerName: 'Tiền nước',
                field: 'waterBill'
              },
              {
                headerName: 'Tiền giữ xe',
                field: 'parkingFee'
              },
              {
                headerName: 'Tiền rác',
                field: 'junkMoney'
              },
              {
                headerName: 'Tổng',
                field: 'total'
              },
              {
                pinned: 'right',
                field: '',
                width: 100,
                floatingFilter: false,
                cellRendererFramework: (params: any) => {
                  if (!params.data || (params.data && moment().isAfter(moment(params.data.date)))) {
                    return null;
                  }

                  return (
                    <>
                      <Tooltip title='Chỉnh sửa'>
                        <Button
                          onClick={() => handleEdit(params.data)}
                          icon={<EditOutlined />}
                          style={{ marginRight: 8 }}
                          type='primary'
                        />
                      </Tooltip>

                      <Tooltip title='Xóa'>
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => handleDeleteData(params.data)}
                        />
                      </Tooltip>
                    </>
                  );
                }
              }
            ]}
            rowData={rowData.map(data => {
              const unitPrice = foreignKey.unitPrice.find(
                (price: any) => price.code === data.formatDate
              );
              const electricityBill = unitPrice
                ? unitPrice.electricity * data.amountOfElectricity
                : 0;
              const waterBill = unitPrice ? unitPrice.water * data.amountOfWater : 0;
              const parkingFee = unitPrice ? unitPrice.parking * data.numberOfVehicles : 0;
              const junkMoney = unitPrice?.junkMoney || 0;
              const room = foreignKey.room.find((type: any) => type.id === data.roomId)?.name;
              const total = electricityBill + waterBill + parkingFee + junkMoney;

              return {
                room,
                electricityBill: formatter.format(electricityBill),
                waterBill: formatter.format(waterBill),
                parkingFee: formatter.format(parkingFee),
                junkMoney: formatter.format(junkMoney),
                total: formatter.format(total),
                ...data
              };
            })}
            onGridReady={e => e.api.sizeColumnsToFit()}
          />
        </ProCard>
      </PageContainer>

      <Modal
        visible={visibleModal}
        title={edit ? 'Chỉnh sửa' : 'Thêm hóa đơn mới'}
        centered
        cancelText='Hủy'
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form name='add-form' form={form} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
          <Form.Item label='Mã' name='code' rules={[{ required: true, message: 'Hãy nhập mã!' }]}>
            <Input autoFocus />
          </Form.Item>

          <Form.Item
            label='Phòng'
            name='roomId'
            rules={[{ required: true, message: 'Hãy chọn phòng!' }]}
          >
            <Select>
              {foreignKey.room.map((room: any) => (
                <Select.Option value={room.id} key={room.id}>
                  {room.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label='Số lượng điện tiêu thụ'
            name='amountOfElectricity'
            rules={[{ required: true, message: 'Hãy nhập số lượng điện tiêu thụ!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label='Số lượng nước tiêu thụ'
            name='amountOfWater'
            rules={[{ required: true, message: 'Hãy nhập số lượng nước tiêu thụ!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label='Số lượng xe'
            name='numberOfVehicles'
            rules={[{ required: true, message: 'Hãy nhập số lượng xe!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label='Thời gian'
            name='date'
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: 'Hãy chọn thời gian!' }]}
          >
            <DatePicker style={{ width: '100%' }} picker='month' format='MM/YYYY' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BillPage;
