import { FC, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, message, Tooltip, Select, DatePicker } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { AgGridReact } from 'ag-grid-react';
import moment from 'moment';

const AgreementPage: FC = () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [rowData, setRowData] = useState<any[]>([]);
  const [edit, setEdit] = useState('');
  const [form] = Form.useForm();
  const [foreignKey, setForeignKey] = useState<any>({
    room: [],
    customer: []
  });
  const db: any = window.roomManagementSystemDB;

  const fetchData = async () => {
    setRowData(await db.agreement.toArray());
  };

  const fetchForeignKeyData = async () => {
    const room = await db.room.toArray();
    const customer = await db.customer.toArray();
    setForeignKey({
      room,
      customer
    });
  };

  useEffect(() => {
    fetchData();
    fetchForeignKeyData();
    // eslint-disable-next-line
  }, []);

  const handleEdit = ({ date, ...rest }: any) => {
    const tempDate = JSON.parse(date);
    setEdit(rest.id);
    setVisibleModal(true);
    form.setFieldsValue({
      date: [moment(tempDate[0]), moment(tempDate[1])],
      ...rest
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(async ({ date, ...rest }) => {
      const value = { date: [date[0].valueOf(), date[1].valueOf()], ...rest };

      const data: any[] = await db.agreement.where('code').equals(value.code).toArray();

      if (data.filter(({ id }) => (edit ? edit !== id : id)).length > 0) {
        message.error(`Hợp đồng ${value.code} đã tồn tại!`);
      }

      const usedCustomers = rowData
        .filter((agreement: any) => (edit ? edit !== agreement.id : agreement.id))
        .filter(
          (agreement: any) =>
            agreement.customerIds.filter((customerId: string) =>
              value.customerIds.includes(customerId)
            ).length > 0
        );

      const usedRooms = rowData
        .filter((agreement: any) => (edit ? edit !== agreement.id : agreement.id))
        .filter((agreement: any) => agreement.roomId === value.roomId);

      if (usedRooms.length > 0) {
        message.error(`Phòng đã được sử dụng!`);
        return;
      }

      if (usedCustomers.length > 0) {
        message.error(`Có khách hàng đang ở phòng khác!`);
        return;
      }

      if (edit) {
        db.agreement.update(edit, value).then((updated: boolean) => {
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

      db.agreement
        .add({
          id: uuidv4(),
          ...value
        })
        .then(async () => {
          message.success('Tạo thành công!');
          setVisibleModal(false);
          form.resetFields();
          await db.room.update(value.roomId, { stillEmpty: true });
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
      title: `Bạn có muốn xóa hợp đồng ${data.code}?`,
      onOk: () => {
        db.agreement
          .where('code')
          .equals(data.code)
          .delete()
          .then(async () => {
            message.success(`Xóa thành công!`);
            await db.room.update(data.roomId, { stillEmpty: false });
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
        header={{ title: 'Quản lý hợp đồng' }}
      >
        <ProCard style={{ height: window.innerHeight - 168 }} className='ag-theme-alpine'>
          <AgGridReact
            animateRows
            defaultColDef={{ floatingFilter: true, sortable: true, filter: true }}
            columnDefs={[
              { headerName: 'Mã', field: 'code' },
              {
                headerName: 'Phòng',
                field: 'room'
              },
              {
                headerName: 'Khách hàng',
                field: 'customer'
              },
              {
                headerName: 'Thời hạn',
                field: 'formatDate'
              },
              {
                pinned: 'right',
                field: '',
                width: 100,
                floatingFilter: false,
                cellRendererFramework: (params: any) => (
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
                )
              }
            ]}
            rowData={rowData.map(({ date, ...rest }) => ({
              room: foreignKey.room.find((type: any) => type.id === rest.roomId)?.name,
              date: JSON.stringify(date),
              formatDate: `từ ${moment(date[0]).format('DD/MM/YYYY')} đến ${moment(date[1]).format(
                'DD/MM/YYYY'
              )}`,
              customer: foreignKey.customer
                .filter((customer: any) => rest.customerIds.includes(customer.id))
                .map((customer: any) => customer.fullName)
                .join(', '),
              ...rest
            }))}
            onGridReady={e => e.api.sizeColumnsToFit()}
          />
        </ProCard>
      </PageContainer>

      <Modal
        visible={visibleModal}
        title={edit ? 'Chỉnh sửa' : 'Thêm hợp đồng mới'}
        centered
        cancelText='Hủy'
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form name='add-form' form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
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
            label='Khách hàng'
            name='customerIds'
            rules={[{ required: true, message: 'Hãy chọn khách hàng!' }]}
          >
            <Select mode='multiple'>
              {foreignKey.customer.map((customer: any) => (
                <Select.Option value={customer.id} key={customer.id}>
                  {customer.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label='Thời hạn'
            name='date'
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: 'Hãy chọn thời hạn!' }]}
          >
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              format={['DD/MM/YYYY', 'DD/MM/YYYY']}
              ranges={{
                '1 tháng': [moment(), moment().add(1, 'months')],
                '3 tháng': [moment(), moment().add(3, 'months')],
                '6 tháng': [moment(), moment().add(6, 'months')]
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AgreementPage;
