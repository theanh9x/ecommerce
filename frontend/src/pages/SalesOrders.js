import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, ShoppingBag, Trash2, Zap } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderType, setOrderType] = useState('normal');
  const [formData, setFormData] = useState({
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
    order_type: 'normal',
    items: []
  });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 0, unit_price: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        axios.get(`${API}/sales-orders`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API}/customers`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API}/products`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const addItemToOrder = () => {
    if (!newItem.product_id || newItem.quantity <= 0 || newItem.unit_price <= 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    const product = products.find(p => p.product_id === newItem.product_id);
    if (product.current_stock < newItem.quantity) {
      toast.error(`Không đủ tồn kho. Hiện còn: ${product.current_stock}`);
      return;
    }
    setFormData({
      ...formData,
      items: [...formData.items, {
        product_id: newItem.product_id,
        product_name: product?.name,
        quantity: parseInt(newItem.quantity),
        unit_price: parseFloat(newItem.unit_price),
        total: parseInt(newItem.quantity) * parseFloat(newItem.unit_price)
      }]
    });
    setNewItem({ product_id: '', quantity: 0, unit_price: 0 });
  };

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }
    try {
      await axios.post(`${API}/sales-orders`, {
        customer_id: formData.customer_id || null,
        date: new Date(formData.date).toISOString(),
        order_type: orderType,
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Tạo đơn hàng thành công');
      setDialogOpen(false);
      setFormData({ customer_id: '', date: new Date().toISOString().split('T')[0], order_type: 'normal', items: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) return <div className="text-center py-12">Đang tải...</div>;

  const normalOrders = orders.filter(o => o.order_type === 'normal');
  const livestreamOrders = orders.filter(o => o.order_type === 'livestream');

  return (
    <div className="space-y-6" data-testid="sales-page">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Quản lý bán hàng</h1><p className="text-muted-foreground">Tạo đơn hàng và bán hàng livestream</p></div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (open) setOrderType('normal'); }}>
          <DialogTrigger asChild><Button data-testid="add-sales-btn"><Plus className="w-4 h-4 mr-2" />Tạo đơn hàng</Button></DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Tạo đơn hàng mới</DialogTitle></DialogHeader>
            <Tabs value={orderType} onValueChange={setOrderType}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="normal" data-testid="normal-tab">Bán thường</TabsTrigger>
                <TabsTrigger value="livestream" data-testid="livestream-tab"><Zap className="w-4 h-4 mr-1" />Livestream</TabsTrigger>
              </TabsList>
              <TabsContent value="normal" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Khách hàng (Tuỳ chọn)</Label><Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })}><SelectTrigger data-testid="sales-customer"><SelectValue placeholder="Chọn khách hàng" /></SelectTrigger><SelectContent>{customers.map(c => <SelectItem key={c.customer_id} value={c.customer_id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                    <div><Label>Ngày bán</Label><input type="date" className="w-full border rounded-sm px-3 py-2" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} data-testid="sales-date" required /></div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Thêm sản phẩm</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <Select value={newItem.product_id} onValueChange={(value) => setNewItem({ ...newItem, product_id: value })}><SelectTrigger data-testid="select-product-sales"><SelectValue placeholder="Sản phẩm" /></SelectTrigger><SelectContent>{products.filter(p => p.status === 'active').map(p => <SelectItem key={p.product_id} value={p.product_id}>{p.name} (Tồn: {p.current_stock})</SelectItem>)}</SelectContent></Select>
                      <Input type="number" placeholder="Số lượng" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} data-testid="item-quantity-sales" />
                      <Input type="number" placeholder="Giá bán" value={newItem.unit_price} onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })} data-testid="item-price-sales" />
                      <Button type="button" onClick={addItemToOrder} data-testid="add-item-sales-btn">Thêm</Button>
                    </div>
                  </div>

                  {formData.items.length > 0 && (
                    <div className="border rounded-sm">
                      <Table>
                        <TableHeader><TableRow><TableHead>Sản phẩm</TableHead><TableHead className="text-right">SL</TableHead><TableHead className="text-right">Giá</TableHead><TableHead className="text-right">Tổng</TableHead><TableHead></TableHead></TableRow></TableHeader>
                        <TableBody>
                          {formData.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                              <TableCell className="text-right font-mono">{formatCurrency(item.unit_price)}</TableCell>
                              <TableCell className="text-right font-mono font-bold">{formatCurrency(item.total)}</TableCell>
                              <TableCell><Button variant="ghost" size="sm" onClick={() => removeItem(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">Tổng cộng:</TableCell>
                            <TableCell className="text-right font-mono font-bold text-lg">{formatCurrency(formData.items.reduce((sum, item) => sum + item.total, 0))}</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <Button type="submit" className="w-full" data-testid="submit-sales">Tạo đơn hàng</Button>
                </form>
              </TabsContent>
              <TabsContent value="livestream"><p className="text-center text-muted-foreground py-8">Tính năng tương tự như bán thường, chỉ khác loại đơn</p></TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="all-orders-tab">Tất cả ({orders.length})</TabsTrigger>
          <TabsTrigger value="normal" data-testid="normal-orders-tab">Bán thường ({normalOrders.length})</TabsTrigger>
          <TabsTrigger value="livestream" data-testid="livestream-orders-tab">Livestream ({livestreamOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="border rounded-sm">
            <Table>
              <TableHeader><TableRow><TableHead>Mã đơn</TableHead><TableHead>Khách hàng</TableHead><TableHead>Loại</TableHead><TableHead>Ngày</TableHead><TableHead className="text-right">Tổng tiền</TableHead><TableHead>Thanh toán</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-mono">{order.order_id}</TableCell>
                    <TableCell>{order.customer_name || 'Khách lẻ'}</TableCell>
                    <TableCell><Badge variant={order.order_type === 'livestream' ? 'default' : 'secondary'}>{order.order_type === 'livestream' ? 'Livestream' : 'Thường'}</Badge></TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right font-mono font-bold">{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell><Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>{order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="normal"><div className="border rounded-sm"><Table><TableHeader><TableRow><TableHead>Mã đơn</TableHead><TableHead>Khách hàng</TableHead><TableHead>Ngày</TableHead><TableHead className="text-right">Tổng tiền</TableHead></TableRow></TableHeader><TableBody>{normalOrders.map(order => (<TableRow key={order.order_id}><TableCell className="font-mono">{order.order_id}</TableCell><TableCell>{order.customer_name || 'Khách lẻ'}</TableCell><TableCell>{new Date(order.date).toLocaleDateString('vi-VN')}</TableCell><TableCell className="text-right font-mono font-bold">{formatCurrency(order.total_amount)}</TableCell></TableRow>))}</TableBody></Table></div></TabsContent>
        <TabsContent value="livestream"><div className="border rounded-sm"><Table><TableHeader><TableRow><TableHead>Mã đơn</TableHead><TableHead>Khách hàng</TableHead><TableHead>Ngày</TableHead><TableHead className="text-right">Tổng tiền</TableHead></TableRow></TableHeader><TableBody>{livestreamOrders.map(order => (<TableRow key={order.order_id}><TableCell className="font-mono">{order.order_id}</TableCell><TableCell>{order.customer_name || 'Khách lẻ'}</TableCell><TableCell>{new Date(order.date).toLocaleDateString('vi-VN')}</TableCell><TableCell className="text-right font-mono font-bold">{formatCurrency(order.total_amount)}</TableCell></TableRow>))}</TableBody></Table></div></TabsContent>
      </Tabs>
    </div>
  );
}
