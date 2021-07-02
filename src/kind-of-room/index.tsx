import { FC, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Form, InputNumber, Input, message, Tooltip } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { AgGridReact } from 'ag-grid-react';

const KindOfRoomPage: FC = () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [rowData, setRowData] = useState<any[]>([]);
  const [edit, setEdit] = useState('');
  const [form] = Form.useForm();
  const db: any = window.roomManagementSystemDB;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
  });


  const fetchData = async () => {
    setRowData(await db.kindOfRoom.toArray());
  };

  useEffect(() => {
    fetchData();
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
        db.kindOfRoom.update(edit, value).then((updated: boolean) => {
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

      const data: any[] = await db.kindOfRoom.where('code').equals(value.code).toArray();

      if (data.length > 0) {
        message.error(`Loại phòng ${value.name} đã tồn tại!`);
      } else {
        db.kindOfRoom
          .add({
            id: uuidv4(),
            ...value
          })
          .then(() => {
            message.success('Tạo thành công!');
            setVisibleModal(false);
            form.resetFields();
            fetchData();
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
      title: `Bạn có muốn xóa loại phòng ${data.name}?`,
      onOk: () => {
        db.kindOfRoom
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
        header={{ title: 'Quản lý loại phòng' }}
      >
        <ProCard style={{ height: window.innerHeight - 168 }} className='ag-theme-alpine'>
          <AgGridReact
            animateRows
            defaultColDef={{ floatingFilter: true, sortable: true, filter: true }}
            columnDefs={[
              { headerName: 'Mã', field: 'code' },
              {
                headerName: 'Tên',
                field: 'name'
              },
              {
                headerName: 'Giá',
                field: 'price',
                valueFormatter: params => formatter.format(params.value)
              },
              {
                headerName: 'Tiền cọc',
                field: 'deposit',
                valueFormatter: params => formatter.format(params.value)
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
            rowData={rowData}
            onGridReady={e => e.api.sizeColumnsToFit()}
          />
        </ProCard>
      </PageContainer>

      <Modal
        visible={visibleModal}
        title={edit ? 'Chỉnh sửa' : 'Thêm loại phòng mới'}
        centered
        cancelText='Hủy'
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form
          name='add-form'
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item label='Mã' name='code' rules={[{ required: true, message: 'Hãy nhập mã!' }]}>
            <Input autoFocus />
          </Form.Item>

          <Form.Item label='Tên' name='name' rules={[{ required: true, message: 'Hãy nhập tên!' }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label='Giá'
            name='price'
            rules={[{ required: true, message: 'Hãy nhập giá!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\s?VNĐ|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label='Tiền cọc'
            name='deposit'
            rules={[{ required: true, message: 'Hãy nhập tiền cọc!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\s?VNĐ|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default KindOfRoomPage;
