import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Building2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', has_vat: false });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API}/suppliers`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSuppliers(res.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/suppliers`, formData, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      toast.success('Thêm nhà cung cấp thành công');
      setDialogOpen(false);
      setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', has_vat: false });
      fetchSuppliers();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) return <div className="text-center py-12">Đang tải...</div>;

  return (
    <div className="space-y-6" data-testid="suppliers-page">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Quản lý nhà cung cấp</h1><p className="text-muted-foreground">Quản lý danh sách nhà cung cấp</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button data-testid="add-supplier-btn"><Plus className="w-4 h-4 mr-2" />Thêm nhà cung cấp</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Thêm nhà cung cấp mới</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Tên nhà cung cấp</Label><Input data-testid="supplier-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div><Label>Người liên hệ</Label><Input data-testid="supplier-contact" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} /></div>
              <div><Label>Số điện thoại</Label><Input data-testid="supplier-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" data-testid="supplier-email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div><Label>Địa chỉ</Label><Input data-testid="supplier-address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
              <div className="flex items-center justify-between"><Label>Xuất VAT</Label><Switch checked={formData.has_vat} onCheckedChange={(checked) => setFormData({ ...formData, has_vat: checked })} data-testid="supplier-vat" /></div>
              <Button type="submit" className="w-full" data-testid="submit-supplier">Thêm nhà cung cấp</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-sm">
        <Table>
          <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Người liên hệ</TableHead><TableHead>SĐT</TableHead><TableHead>Email</TableHead><TableHead>VAT</TableHead></TableRow></TableHeader>
          <TableBody>
            {suppliers.map(sup => (
              <TableRow key={sup.supplier_id}>
                <TableCell className="font-medium">{sup.name}</TableCell>
                <TableCell>{sup.contact_person}</TableCell>
                <TableCell className="font-mono">{sup.phone}</TableCell>
                <TableCell>{sup.email}</TableCell>
                <TableCell><Badge variant={sup.has_vat ? 'default' : 'secondary'}>{sup.has_vat ? 'Có' : 'Không'}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
