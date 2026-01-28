import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier_id: '',
    date: new Date().toISOString().split('T')[0],
    items: []
  });
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 0, unit_price: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        axios.get(`${API}/purchase-orders`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API}/suppliers`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API}/products`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setOrders(ordersRes.data);
      setSuppliers(suppliersRes.data);
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
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }
    try {
      await axios.post(`${API}/purchase-orders`, {
        supplier_id: formData.supplier_id,
        date: new Date(formData.date).toISOString(),
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Tạo phiếu nhập thành công');
      setDialogOpen(false);
      setFormData({ supplier_id: '', date: new Date().toISOString().split('T')[0], items: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) return <div className="text-center py-12">Đang tải...</div>;

  return (
    <div className="space-y-6" data-testid="purchases-page">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Quản lý nhập hàng</h1><p className="text-muted-foreground">Tạo phiếu nhập và quản lý tồn kho</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button data-testid="add-purchase-btn"><Plus className="w-4 h-4 mr-2" />Tạo phiếu nhập</Button></DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Tạo phiếu nhập hàng mới</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nhà cung cấp</Label><Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })} required><SelectTrigger data-testid="purchase-supplier"><SelectValue placeholder="Chọn NCC" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.supplier_id} value={s.supplier_id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Ngày nhập</Label><input type="date" className="w-full border rounded-sm px-3 py-2" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} data-testid="purchase-date" required /></div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Thêm sản phẩm</h3>
                <div className="grid grid-cols-4 gap-2">
                  <Select value={newItem.product_id} onValueChange={(value) => setNewItem({ ...newItem, product_id: value })}><SelectTrigger data-testid="select-product"><SelectValue placeholder="Sản phẩm" /></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.product_id} value={p.product_id}>{p.name}</SelectItem>)}</SelectContent></Select>
                  <Input type="number" placeholder="Số lượng" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} data-testid="item-quantity" />
                  <Input type="number" placeholder="Giá nhập" value={newItem.unit_price} onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })} data-testid="item-price" />
                  <Button type="button" onClick={addItemToOrder} data-testid="add-item-btn">Thêm</Button>
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

              <Button type="submit" className="w-full" data-testid="submit-purchase">Tạo phiếu nhập</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-sm">
        <Table>
          <TableHeader><TableRow><TableHead>Mã phiếu</TableHead><TableHead>Nhà cung cấp</TableHead><TableHead>Ngày</TableHead><TableHead className="text-right">Tổng tiền</TableHead><TableHead>Thanh toán</TableHead></TableRow></TableHeader>
          <TableBody>
            {orders.map(order => (
              <TableRow key={order.po_id}>
                <TableCell className="font-mono">{order.po_id}</TableCell>
                <TableCell>{order.supplier_name}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell className="text-right font-mono font-bold">{formatCurrency(order.total_amount)}</TableCell>
                <TableCell><Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>{order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
