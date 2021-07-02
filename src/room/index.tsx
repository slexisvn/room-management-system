import { FC, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, message, Tooltip, Select } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { AgGridReact } from 'ag-grid-react';

const RoomPage: FC = () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [rowData, setRowData] = useState<any[]>([]);
  const [edit, setEdit] = useState('');
  const [foreignKey, setForeignKey] = useState<any>({
    kindOfRoom: []
  });
  const [form] = Form.useForm();
  const db: any = window.roomManagementSystemDB;

  const fetchRoomData = async () => {
    setRowData(await db.room.toArray());
  };

  const fetchForeignKeyData = async () => {
    const kindOfRoom = await db.kindOfRoom.toArray();
    setForeignKey({
      kindOfRoom
    });
  };

  useEffect(() => {
    fetchRoomData();
    fetchForeignKeyData();
    // eslint-disable-next-line
  }, []);

  const handleEdit = (data: any) => {
    setEdit(data.id);
    setVisibleModal(true);
    form.setFieldsValue(data);
  };

  const handleModalOk = () => {
    form.validateFields().then(async value => {
      if (edit) {
        db.room.update(edit, value).then((updated: boolean) => {
          if (updated) {
            message.success('Cập nhật thành công!');
            setVisibleModal(false);
            setEdit('');
            form.resetFields();
            fetchRoomData();
          } else {
            message.error('Cập nhật thất bại!');
          }
        });
        return;
      }

      const data: any[] = await db.room.where('code').equals(value.code).toArray();

      if (data.length > 0) {
        message.error(`Phòng ${value.name} đã tồn tại!`);
      } else {
        db.room
          .add({
            id: uuidv4(),
            ...value
          })
          .then(() => {
            message.success('Tạo thành công!');
            setVisibleModal(false);
            form.resetFields();
            fetchRoomData();
          });
      }
    });
  };

  const handleModalCancel = () => {
    setVisibleModal(false);
    setEdit('');
    form.resetFields();
  };

  const handleDeleteData = (data: any) => {
    Modal.warning({
      title: `Bạn có muốn xóa phòng ${data.name}?`,
      onOk: () => {
        db.room
          .where('code')
          .equals(data.code)
          .delete()
          .then(() => {
            message.success(`Xóa thành công!`);
            fetchRoomData();
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
        header={{ title: 'Quản lý phòng' }}
      >
        <ProCard style={{ height: window.innerHeight - 168 }} className='ag-theme-alpine'>
          <AgGridReact
            animateRows
            defaultColDef={{ floatingFilter: true, sortable: true, filter: true }}
            columnDefs={[
              { headerName: 'Mã', field: 'code' },
              { headerName: 'Tên', field: 'name' },
              {
                headerName: 'Loại',
                field: 'kindOfRoom'
              },
              {
                headerName: 'Còn trống',
                field: 'stillEmpty',
                valueFormatter: params => (!params.value ? 'Có' : 'Không')
              },
              {
                pinned: 'right',
                field: '',
                width: 100,
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
            rowData={rowData.map(data => ({
              kindOfRoom: foreignKey.kindOfRoom.find((type: any) => type.id === data.kindOfRoomId)
                ?.name,
              ...data
            }))}
            onGridReady={e => e.api.sizeColumnsToFit()}
          />
        </ProCard>
      </PageContainer>

      <Modal
        visible={visibleModal}
        title={edit ? 'Chỉnh sửa' : 'Thêm phòng mới'}
        centered
        cancelText='Hủy'
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form name='add-form' form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label='Mã' name='code' rules={[{ required: true, message: 'Hãy nhập mã!' }]}>
            <Input autoFocus />
          </Form.Item>

          <Form.Item label='Tên' name='name' rules={[{ required: true, message: 'Hãy nhập tên!' }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label='Loại phòng'
            name='kindOfRoomId'
            rules={[{ required: true, message: 'Hãy chọn loại phòng!' }]}
          >
            <Select optionLabelProp='label'>
              {foreignKey.kindOfRoom.map((type: any) => (
                <Select.Option value={type.id} key={type.id} label={type.name}>
                  {type.name} ({type.price})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RoomPage;
