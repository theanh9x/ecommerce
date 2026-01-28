import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, FileText } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn khoảng thời gian');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/reports/export`,
        {
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          report_type: reportType
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${startDate}_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Xuất báo cáo thành công');
    } catch (error) {
      toast.error('Không thể xuất báo cáo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div>
        <h1 className="text-3xl font-heading font-bold">Báo cáo</h1>
        <p className="text-muted-foreground">Xuất báo cáo kinh doanh</p>
      </div>

      <div className="border rounded-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại báo cáo</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger data-testid="report-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Báo cáo bán hàng</SelectItem>
                <SelectItem value="purchases">Báo cáo nhập hàng</SelectItem>
                <SelectItem value="inventory">Báo cáo tồn kho</SelectItem>
                <SelectItem value="cashflow">Báo cáo dòng tiền</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Từ ngày</label>
            <input
              type="date"
              className="w-full border rounded-sm px-3 py-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="start-date"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Đến ngày</label>
            <input
              type="date"
              className="w-full border rounded-sm px-3 py-2 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="end-date"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleExport}
              disabled={loading}
              className="w-full"
              data-testid="export-report-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Đang xuất...' : 'Xuất Excel'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-sm p-6 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-heading font-bold mb-2">Báo cáo bán hàng</h3>
          <p className="text-sm text-muted-foreground">Chi tiết các đơn hàng, doanh thu theo khoảng thời gian</p>
        </div>
        <div className="border rounded-sm p-6 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-heading font-bold mb-2">Báo cáo nhập hàng</h3>
          <p className="text-sm text-muted-foreground">Phiếu nhập, chi phí, nhà cung cấp</p>
        </div>
        <div className="border rounded-sm p-6 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-heading font-bold mb-2">Báo cáo tồn kho</h3>
          <p className="text-sm text-muted-foreground">Tình trạng tồn kho của tất cả sản phẩm</p>
        </div>
      </div>
    </div>
  );
}
