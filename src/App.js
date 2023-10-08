




import React, { useState, useEffect } from 'react';
import { Table, Input, InputNumber, Button, Form, notification, DatePicker, Select, Row, Col } from 'antd';
import axios from 'axios';
import moment from 'moment';

const SERVER_URL = 'http://localhost:3100/grocery';
const { Option } = Select;

function App() {
  
    const [data, setData] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(10); 
    const [form] = Form.useForm();
  
    useEffect(() => {
      fetchData();
    }, [currentPage, pageSize]);
    useEffect(() =>
    {
     setCurrentPage(1) 
    },[totalItems])
    const fetchData = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}?page=${currentPage}&limit=${pageSize}`);
        setData(response.data.data);
        setTotalItems(response.data.totalItems);
      } catch (error) {
        notification.error({
          message: 'Error',
          description: 'Error fetching data from server',
        });
      }
    };
  
    const handleTableChange = (pagination) => {
      setCurrentPage(pagination.current);
      setPageSize(pagination.pageSize);
    };

  const addItem = async (values) => {
    try {
      if (editingItem) {
        await axios.put(`${SERVER_URL}/${editingItem._id}`, {
          ...values,
          expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        });
        notification.success({
          message: 'Success',
          description: 'Item updated successfully!',
        });
      } else {
        await axios.post(SERVER_URL, {
          ...values,
          expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        });
        notification.success({
          message: 'Success',
          description: 'Item added successfully!',
        });
      }
      form.resetFields();
      setEditingItem(null);
      fetchData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Error ${editingItem ? 'updating' : 'adding'} item`,
      });
    }
  };

  const editItem = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      item: record.item,
      quantity: record.quantity,
      expiryDate: moment(record.expiryDate),
      unit: record.unit,
    });
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/${id}`);
      notification.success({
        message: 'Success',
        description: 'Item deleted successfully!',
      });
      fetchData();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Error deleting item',
      });
    }
  };

  const columns = [
    {
      title: 'Item', dataIndex: 'item', key: 'item',
      render: (itemName) => <div style={{ textTransform: "capitalize" }}>{itemName}</div>
    },
    {
      title: 'Quantity', dataIndex: 'quantity', key: 'quantity',
     
    },
    {
      title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate',
      render: (expiryDate) => moment(expiryDate).format('YYYY-MM-DD')
    },
    {
      title: 'Unit', dataIndex: 'unit', key: 'unit',
      render: (unit) => <div style={{ textTransform: "capitalize" }}>{unit}</div>},
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          
          <Row gutter={16}>
            <Col>
            <Button onClick={() => editItem(record)} >
            Edit
          </Button>       
            </Col>
            <Col>
            <Button type="primary" onClick={() => deleteItem(record._id)} danger >
            Delete
          </Button>
            </Col>
          </Row>
         
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Grocery Inventory</h1>
      <Form
        form={form}
        onFinish={addItem}
        layout="vertical"
        style={{ marginBottom: '20px' }}
      >
        <Row gutter={16}>
          <Col >
            <Form.Item
              name="item"
              rules={[
                { required: true, message: 'Please input an item!' },
                { pattern: /^[a-zA-Z0-9\s]+$/, message: 'No special characters allowed!' },
              ]}
            >
              <Input placeholder="Item" />
            </Form.Item>
          </Col>
          <Col >
            <Form.Item
              name="quantity"
              rules={[{ required: true, message: 'Please input quantity!' }]}
            >
              <InputNumber placeholder="Quantity" min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col >
            <Form.Item
              name="expiryDate"
              rules={[{ required: true, message: 'Please select an expiry date!' }]}
            >
              <DatePicker placeholder="Expiry Date" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col >
            <Form.Item
              name="unit"
              rules={[{ required: true, message: 'Please select a unit!' }]}
            >
              <Select 
                showSearch
                placeholder="Select a unit"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: '100%' }}
              >
                <Option value="kilogram">Kilogram</Option>
                <Option value="gram">Gram</Option>
                <Option value="liter">Liter</Option>
                <Option value="milliliter">Milliliter</Option>
                <Option value="piece">Piece</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col >
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                {editingItem ? "Update":"Add Item"}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table 
        dataSource={data} 
        columns={columns} 
        rowKey="_id" 
        pagination={{ current: currentPage, pageSize, total: totalItems }}
        onChange={handleTableChange} 
      />
    </div>
  );
}

export default App;





