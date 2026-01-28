import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Warehouse, Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API}/inventory`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setInventory(res.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Hết hàng', variant: 'destructive' };
    if (quantity < 10) return { label: 'Sắp hết', variant: 'secondary' };
    return { label: 'Còn hàng', variant: 'default' };
  };

  if (loading) return <div className="text-center py-12">Đang tải...</div>;

  const totalProducts = inventory.length;
  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = inventory.filter(item => item.quantity < 10).length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;

  return (
    <div className="space-y-6" data-testid="inventory-page">
      <div>
        <h1 className="text-3xl font-heading font-bold">Quản lý tồn kho</h1>
        <p className="text-muted-foreground">Theo dõi tồn kho tự động</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
              <p className="text-2xl font-mono font-bold">{totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="border rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng tồn kho</p>
              <p className="text-2xl font-mono font-bold">{totalStock}</p>
            </div>
            <Warehouse className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="border rounded-sm p-4 bg-amber-50">
          <div>
            <p className="text-sm text-amber-700">Sắp hết hàng</p>
            <p className="text-2xl font-mono font-bold text-amber-700">{lowStockCount}</p>
          </div>
        </div>
        <div className="border rounded-sm p-4 bg-red-50">
          <div>
            <p className="text-sm text-red-700">Hết hàng</p>
            <p className="text-2xl font-mono font-bold text-red-700">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã SKU</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Cập nhật cuối</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const status = getStockStatus(item.quantity);
              return (
                <TableRow key={item.product_id}>
                  <TableCell className="font-mono">{item.sku}</TableCell>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell className="text-right font-mono font-bold">{item.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.last_updated).toLocaleString('vi-VN')}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
