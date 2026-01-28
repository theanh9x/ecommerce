import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [typeFormData, setTypeFormData] = useState({ name: '', category_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, typesRes] = await Promise.all([
        axios.get(`${API}/categories`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API}/product-types`, { withCredentials: true, headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setCategories(categoriesRes.data);
      setProductTypes(typesRes.data);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${API}/categories/${currentCategory.category_id}`, formData, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Cập nhật danh mục thành công');
      } else {
        await axios.post(`${API}/categories`, formData, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Thêm danh mục thành công');
      }
      setDialogOpen(false);
      setFormData({ name: '', description: '' });
      setEditMode(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
    }
  };

  const handleSubmitType = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/product-types`, typeFormData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Thêm loại sản phẩm thành công');
      setTypeDialogOpen(false);
      setTypeFormData({ name: '', category_id: '' });
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await axios.delete(`${API}/categories/${categoryId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Xóa danh mục thành công');
      fetchData();
    } catch (error) {
      toast.error('Không thể xóa danh mục');
    }
  };

  if (loading) return <div className="text-center py-12">Đang tải...</div>;

  return (
    <div className="space-y-6" data-testid="categories-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Quản lý danh mục</h1>
          <p className="text-muted-foreground">Quản lý danh mục và loại sản phẩm</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="add-type-btn"><Plus className="w-4 h-4 mr-2" />Thêm loại SP</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm loại sản phẩm</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitType} className="space-y-4">
                <div><Label>Tên loại</Label><Input data-testid="type-name" value={typeFormData.name} onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })} required /></div>
                <div><Label>Danh mục</Label><select className="w-full border rounded px-3 py-2" value={typeFormData.category_id} onChange={(e) => setTypeFormData({ ...typeFormData, category_id: e.target.value })} required>{categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}</select></div>
                <Button type="submit" className="w-full" data-testid="submit-type">Thêm loại</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-category-btn"><Plus className="w-4 h-4 mr-2" />Thêm danh mục</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editMode ? 'Chỉnh sửa' : 'Thêm'} danh mục</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitCategory} className="space-y-4">
                <div><Label>Tên danh mục</Label><Input data-testid="category-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div><Label>Mô tả</Label><Textarea data-testid="category-desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
                <Button type="submit" className="w-full" data-testid="submit-category">{editMode ? 'Cập nhật' : 'Thêm'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-sm p-4">
          <h2 className="text-xl font-heading font-bold mb-4">Danh mục</h2>
          <Table>
            <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Mô tả</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat.category_id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{cat.description}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setCurrentCategory(cat); setFormData({ name: cat.name, description: cat.description }); setEditMode(true); setDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat.category_id)} data-testid={`delete-cat-${cat.category_id}`}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="border rounded-sm p-4">
          <h2 className="text-xl font-heading font-bold mb-4">Loại sản phẩm</h2>
          <Table>
            <TableHeader><TableRow><TableHead>Tên</TableHead><TableHead>Danh mục</TableHead></TableRow></TableHeader>
            <TableBody>
              {productTypes.map(type => (
                <TableRow key={type.type_id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{type.category_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
