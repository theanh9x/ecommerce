import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Users, Search } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', group: '', notes: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API}/customers`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setCustomers(res.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/customers`, formData, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Thêm khách hàng thành công');
      setDialogOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '', group: '', notes: '' });
      fetchCustomers();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.phone && c.phone.includes(searchTerm)));

  if (loading) return <div className="text-center py-12">Đang tải...</div>;

  return (
    <div className="space-y-6" data-testid="customers-page">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Quản lý khách hàng</h1><p className="text-muted-foreground">Quản lý danh sách khách hàng</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button data-testid="add-customer-btn"><Plus className="w-4 h-4 mr-2" />Thêm khách hàng</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Thêm khách hàng mới</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Tên khách hàng</Label><Input data-testid="customer-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div><Label>Số điện thoại</Label><Input data-testid="customer-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" data-testid="customer-email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div><Label>Địa chỉ</Label><Input data-testid="customer-address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
              <div><Label>Nhóm</Label><Input data-testid="customer-group" value={formData.group} onChange={(e) => setFormData({ ...formData, group: e.target.value })} placeholder="VIP, Thường..." /></div>
              <Button type="submit" className="w-full" data-testid="submit-customer">Thêm khách hàng</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Tìm khách hàng..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} data-testid="search-customers" /></div>

      <div className="border rounded-sm">
        <Table>
          <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>SĐT</TableHead><TableHead>Email</TableHead><TableHead>Địa chỉ</TableHead><TableHead>Nhóm</TableHead></TableRow></TableHeader>
          <TableBody>
            {filteredCustomers.map(cust => (
              <TableRow key={cust.customer_id}>
                <TableCell className="font-medium">{cust.name}</TableCell>
                <TableCell className="font-mono">{cust.phone}</TableCell>
                <TableCell>{cust.email}</TableCell>
                <TableCell>{cust.address}</TableCell>
                <TableCell>{cust.group}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
