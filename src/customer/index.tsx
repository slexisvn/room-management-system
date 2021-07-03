import { FC, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, message, Tooltip, InputNumber, DatePicker, Radio } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { AgGridReact } from 'ag-grid-react';

const CustomerPage: FC = () => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [rowData, setRowData] = useState<any[]>([]);
  const [edit, setEdit] = useState('');
  const [form] = Form.useForm();
  const db: any = window.roomManagementSystemDB;

  const fetchData = async () => {
    setRowData(await db.customer.toArray());
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleEdit = ({ dateOfBirth, ...rest }: any) => {
    setEdit(rest.id);
    setVisibleModal(true);
    form.setFieldsValue({ dateOfBirth: dateOfBirth && moment(dateOfBirth), ...rest });
  };

  const handleModalOk = () => {
    form.validateFields().then(async ({ dateOfBirth, ...rest }) => {
      const data: any[] = await db.customer.where('code').equals(rest.code).toArray();
      const value = { dateOfBirth: dateOfBirth?.valueOf(), ...rest };

      if (data.filter(({ id }) => (edit ? edit !== id : id)).length > 0) {
        message.error(`Khách hàng ${rest.fullName} đã tồn tại!`);
        return;
      }

      if (edit) {
        db.customer.update(edit, value).then((updated: boolean) => {
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

      db.customer
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
    });
  };

  const handleModalCancel = () => {
    setVisibleModal(false);
    setEdit('');
    form.resetFields();
  };

  const handleDeleteData = (data: any) => {
    Modal.warning({
      title: `Bạn có muốn xóa khách hàng ${data.fullName}?`,
      onOk: () => {
        db.customer
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
        header={{ title: 'Quản lý khách hàng' }}
      >
        <ProCard style={{ height: window.innerHeight - 168 }} className='ag-theme-alpine'>
          <AgGridReact
            animateRows
            defaultColDef={{ floatingFilter: true, sortable: true, filter: true }}
            columnDefs={[
              { headerName: 'Mã', field: 'code' },
              {
                headerName: 'Họ và tên',
                field: 'fullName'
              },
              {
                headerName: 'Số CMND',
                field: 'identityCardNumber'
              },
              {
                headerName: 'Ngày sinh',
                field: 'dateOfBirth',
                valueFormatter: params => params.value && moment(params.value).format('DD/MM/YYYY')
              },
              {
                headerName: 'Giới tính',
                field: 'sex'
              },
              {
                headerName: 'Địa chỉ',
                field: 'address'
              },
              {
                headerName: 'Số điện thoại',
                field: 'phoneNumber'
              },
              {
                headerName: 'Nghề nghiệp',
                field: 'job'
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
            rowData={rowData}
            onGridReady={e => e.api.sizeColumnsToFit()}
          />
        </ProCard>
      </PageContainer>

      <Modal
        visible={visibleModal}
        title={edit ? 'Chỉnh sửa' : 'Thêm khách hàng mới'}
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
          initialValues={{ sex: 'Nam' }}
        >
          <Form.Item label='Mã' name='code' rules={[{ required: true, message: 'Hãy nhập mã!' }]}>
            <Input autoFocus />
          </Form.Item>

          <Form.Item
            label='Họ và tên'
            name='fullName'
            rules={[{ required: true, message: 'Hãy nhập họ và tên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='Số CMND'
            name='identityCardNumber'
            rules={[{ required: true, message: 'Hãy nhập số CMND!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label='Ngày sinh' name='dateOfBirth'>
            <DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
          </Form.Item>

          <Form.Item label='Giới tính' name='sex'>
            <Radio.Group>
              <Radio value='Nam'>Nam</Radio>
              <Radio value='Nữ'>Nữ</Radio>
              <Radio value='Khác'>Khác</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label='Địa chỉ' name='address'>
            <Input />
          </Form.Item>

          <Form.Item label='Số điện thoại' name='phoneNumber'>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label='Nghề nghiệp' name='job' style={{ marginBottom: 0 }}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CustomerPage;
