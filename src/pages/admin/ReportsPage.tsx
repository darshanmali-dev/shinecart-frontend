import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Loader2, Download, Printer, ArrowLeft } from 'lucide-react';
import {
  reportService,
  UserReportItem,
  OrderReportItem,
  OrderReportResponse,
  ProductReportItem,
} from '@/services/reportService';

type ReportType = 'users' | 'orders' | 'products';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<ReportType>('orders');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserReportItem[]>([]);
  const [orderData, setOrderData] = useState<OrderReportResponse | null>(null);
  const [productData, setProductData] = useState<ProductReportItem[]>([]);
  const [generated, setGenerated] = useState(false);

  const reportTitle = {
    users: 'User Report',
    orders: 'Order & Revenue Report',
    products: 'Product Performance Report',
  }[reportType];

  const handleGenerate = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both From and To dates');
      return;
    }
    if (fromDate > toDate) {
      toast.error('From date cannot be after To date');
      return;
    }

    try {
      setLoading(true);
      setGenerated(false);

      if (reportType === 'users') {
        const data = await reportService.getUserReport(fromDate, toDate);
        setUserData(data);
      } else if (reportType === 'orders') {
        const data = await reportService.getOrderReport(fromDate, toDate);
        setOrderData(data);
      } else {
        const data = await reportService.getProductReport(fromDate, toDate);
        setProductData(data);
      }

      setGenerated(true);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // ─── CSV Download ───────────────────────────────────────────────
  const downloadCSV = () => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'users') {
      csvContent = [
        ['Username', 'Email', 'Phone', 'Registered On', 'Status', 'Role'].join(','),
        ...userData.map(u => [
          u.username, u.email, u.phone, u.createdAt, u.status, u.role
        ].join(','))
      ].join('\n');
      filename = `ShineCart_User_Report_${fromDate}_to_${toDate}.csv`;

    } else if (reportType === 'orders' && orderData) {
      csvContent = [
        ['Order Number', 'Customer', 'Date', 'Delivery Type',
          'Payment Status', 'Order Status', 'Amount (Rs.)'].join(','),
        ...orderData.orders.map(o => [
          o.orderNumber, o.customerName, `="${o.orderDate}"`,
          o.deliveryType, o.paymentStatus, o.status,
          o.total.toFixed(2)
        ].join(',')),
        [],
        [`Total Orders: ${orderData.totalOrders}`],
        [`Total Revenue: Rs.${orderData.totalRevenue.toFixed(2)}`]
      ].join('\n');
      filename = `ShineCart_Order_Report_${fromDate}_to_${toDate}.csv`;

    } else if (reportType === 'products') {
      csvContent = [
        ['Product Name', 'Category', 'Metal', 'Qty Sold', 'Revenue (Rs.)'].join(','),
        ...productData.map(p => [
          p.productName, p.category, p.metal,
          p.totalQuantitySold, p.totalRevenue
        ].join(','))
      ].join('\n');
      filename = `ShineCart_Product_Report_${fromDate}_to_${toDate}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded successfully');
  };

  // ─── JSON Download ──────────────────────────────────────────────
  const downloadJSON = () => {
    let jsonData: object = {};
    let filename = '';

    const exportMeta = {
      projectName: 'ShineCart',
      reportType: reportTitle,
      dataType: reportType === 'users'
        ? 'User Data'
        : reportType === 'orders'
          ? 'Order and Revenue Data'
          : 'Product Performance Data',
      period: { from: fromDate, to: toDate },
      exportedAt: new Date().toLocaleString('en-IN'),
    };

    if (reportType === 'users') {
      jsonData = {
        ...exportMeta,
        totalUsers: userData.length,
        data: userData,
      };
      filename = `ShineCart_User_Report_${fromDate}_to_${toDate}.json`;

    } else if (reportType === 'orders' && orderData) {
      jsonData = {
        ...exportMeta,
        totalOrders: orderData.totalOrders,
        totalRevenue: orderData.totalRevenue,
        data: orderData.orders,
      };
      filename = `ShineCart_Order_Report_${fromDate}_to_${toDate}.json`;

    } else if (reportType === 'products') {
      jsonData = {
        ...exportMeta,
        totalProductsSold: productData.reduce((sum, p) => sum + p.totalQuantitySold, 0),
        totalRevenue: productData.reduce((sum, p) => sum + p.totalRevenue, 0),
        data: productData,
      };
      filename = `ShineCart_Product_Report_${fromDate}_to_${toDate}.json`;
    }

    const blob = new Blob(
      [JSON.stringify(jsonData, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON downloaded successfully');
  };

  // ─── PDF Download ───────────────────────────────────────────────
  const downloadPDF = async () => {
    const doc = new jsPDF();
    const exportDateTime = new Date().toLocaleString('en-IN');
    const pageWidth = doc.internal.pageSize.getWidth();

    const signatureImg = await new Promise<string | null>((resolve) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `${window.location.origin}/signature.png`;
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 200;
      canvas.height = img.naturalHeight || 80;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        console.log('Signature loaded, dataUrl length:', dataUrl.length);
        resolve(dataUrl);
      } else {
        console.log('Canvas context failed');
        resolve(null);
      }
    } catch (e) {
      console.log('Canvas error:', e);
      resolve(null);
    }
  };
  img.onerror = (e) => {
    console.log('Image error:', e);
    resolve(null);
  };
});

    // ── Header ──────────────────────────────────────────────────
    // Company / Project Name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 115, 85); // ShineCart brown
    doc.text('ShineCart', pageWidth / 2, 16, { align: 'center' });

    // Report Title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(reportTitle, pageWidth / 2, 24, { align: 'center' });

    // Divider line below header
    doc.setDrawColor(139, 115, 85);
    doc.setLineWidth(0.5);
    doc.line(14, 28, pageWidth - 14, 28);

    // Report Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    // Left side details
    doc.text(`Report Period : ${fromDate} to ${toDate}`, 14, 35);
    doc.text(`Data Type     : ${
      reportType === 'users'
        ? 'User Data'
        : reportType === 'orders'
          ? 'Order and Revenue Data'
          : 'Product Performance Data'
    }`, 14, 41);

    // Right side details
    doc.text(`Date & Time of Export : ${exportDateTime}`, pageWidth - 14, 35, { align: 'right' });
    doc.text(`Generated By          : Admin`, pageWidth - 14, 41, { align: 'right' });

    // Second divider line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, 45, pageWidth - 14, 45);

    // ── Data Columns Label ───────────────────────────────────────
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('DATA COLUMNS :', 14, 51);

    const columnLabels = {
      users: 'Sr. No. | Username | Email | Phone | Registered On | Status | Role',
      orders: 'Sr. No. | Order No. | Customer | Date | Delivery | Payment | Status | Amount',
      products: 'Sr. No. | Product Name | Category | Metal | Qty Sold | Revenue',
    }[reportType];

    doc.setFont('helvetica', 'normal');
    doc.text(columnLabels, 14, 57);

    // ── Table ────────────────────────────────────────────────────
    if (reportType === 'users') {
      autoTable(doc, {
        startY: 62,
        head: [['#', 'Username', 'Email', 'Phone', 'Registered On', 'Status', 'Role']],
        body: userData.map((u, i) => [
          i + 1, u.username, u.email, u.phone, u.createdAt, u.status, u.role
        ]),
        foot: [['', '', '', '', '', `Total Users: ${userData.length}`, '']],
        headStyles: { fillColor: [139, 115, 85] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 248, 245] },
        styles: { fontSize: 8 },
      });

    } else if (reportType === 'orders' && orderData) {
      autoTable(doc, {
        startY: 62,
        head: [['#', 'Order No.', 'Customer', 'Date', 'Delivery', 'Payment', 'Status', 'Amount']],
        body: orderData.orders.map((o, i) => [
          i + 1, o.orderNumber, o.customerName, o.orderDate,
          o.deliveryType, o.paymentStatus, o.status,
          `Rs.${o.total.toFixed(2)}`
        ]),
        foot: [[
          '', '', '', '', '', '',
          `Total Orders: ${orderData.totalOrders}`,
          `Revenue: Rs.${orderData.totalRevenue.toFixed(2)}`
        ]],
        headStyles: { fillColor: [139, 115, 85] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 248, 245] },
        styles: { fontSize: 8 },
      });

    } else if (reportType === 'products') {
      autoTable(doc, {
        startY: 62,
        head: [['#', 'Product Name', 'Category', 'Metal', 'Qty Sold', 'Revenue']],
        body: productData.map((p, i) => [
          i + 1, p.productName, p.category, p.metal,
          p.totalQuantitySold, `Rs.${p.totalRevenue.toFixed(2)}`
        ]),
        foot: [[
          '', '', '', 'Total',
          productData.reduce((sum, p) => sum + p.totalQuantitySold, 0),
          `Rs.${productData.reduce((sum, p) => sum + p.totalRevenue, 0).toFixed(2)}`
        ]],
        headStyles: { fillColor: [139, 115, 85] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 248, 245] },
        styles: { fontSize: 8 },
      });
    }

    // ── Admin Signature Block ────────────────────────────────────
    // Get Y position after table ends
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    const signatureY = finalY + 30;

    // Divider above signature
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(pageWidth - 80, finalY, pageWidth - 14, finalY);

    // Signature label
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Admin Signature', pageWidth - 47, finalY + 6, { align: 'center' });
    if(signatureImg){
      console.log('finalY:', finalY, 'pageWidth:', pageWidth);
    doc.addImage(signatureImg, 'PNG', pageWidth - 75, finalY + 5, 55, 25);
    }

    // Signature line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 80, signatureY, pageWidth - 14, signatureY);

    // Admin Name
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Admin', pageWidth - 47, signatureY + 6, { align: 'center' });

    // Admin Position
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('ShineCart Administrator', pageWidth - 47, signatureY + 12, { align: 'center' });

    // ── Save ─────────────────────────────────────────────────────
    doc.save(
      `ShineCart_${reportTitle.replace(/ /g, '_')}_${fromDate}_to_${toDate}.pdf`
    );

    toast.success('PDF downloaded successfully');
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8">

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <EnhancedButton
          variant="ghost"
          onClick={() => navigate('/admin/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </EnhancedButton>
        <h1 className="font-luxury text-4xl font-bold">Reports</h1>
      </div>

      {/* Controls Card */}
      <Card className="mb-8 print:hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

            {/* Report Type */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value as ReportType);
                  setGenerated(false);
                }}
                className="border rounded-lg px-3 py-2 text-sm
                  bg-background focus:outline-none focus:ring-2
                  focus:ring-primary"
              >
                <option value="users">User Report</option>
                <option value="orders">Order & Revenue Report</option>
                <option value="products">Product Performance Report</option>
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setGenerated(false);
                }}
                className="border rounded-lg px-3 py-2 text-sm
                  bg-background focus:outline-none focus:ring-2
                  focus:ring-primary"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setGenerated(false);
                }}
                className="border rounded-lg px-3 py-2 text-sm
                  bg-background focus:outline-none focus:ring-2
                  focus:ring-primary"
              />
            </div>

            {/* Generate Button */}
            <EnhancedButton
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </EnhancedButton>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {generated && (
        <Card>
          <CardContent className="p-6">

            {/* Report Header */}
            <div className="flex justify-between items-start mb-6 print:mb-4">
              <div>
                <h2 className="text-2xl font-bold font-luxury">
                  ShineCart — {reportTitle}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Period: {fromDate} to {toDate}
                </p>
                <p className="text-sm text-muted-foreground">
                  Data Type: {
                    reportType === 'users'
                      ? 'User Data'
                      : reportType === 'orders'
                        ? 'Order and Revenue Data'
                        : 'Product Performance Data'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Exported At: {new Date().toLocaleString('en-IN')}
                </p>
              </div>

              {/* Download Buttons */}
              <div className="flex gap-2 print:hidden flex-wrap justify-end">
                <EnhancedButton variant="outline" onClick={downloadCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </EnhancedButton>
                <EnhancedButton variant="outline" onClick={downloadJSON}>
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </EnhancedButton>
                <EnhancedButton variant="outline" onClick={downloadPDF}>
                  <Printer className="h-4 w-4 mr-2" />
                  PDF
                </EnhancedButton>
              </div>
            </div>

            {/* USER REPORT TABLE */}
            {reportType === 'users' && (
              <>
                {userData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No users found for the selected date range
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-primary text-primary-foreground">
                          <th className="p-3 text-left border">#</th>
                          <th className="p-3 text-left border">Username</th>
                          <th className="p-3 text-left border">Email</th>
                          <th className="p-3 text-left border">Phone</th>
                          <th className="p-3 text-left border">Registered On</th>
                          <th className="p-3 text-left border">Status</th>
                          <th className="p-3 text-left border">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.map((user, index) => (
                          <tr
                            key={index}
                            className={index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}
                          >
                            <td className="p-3 border">{index + 1}</td>
                            <td className="p-3 border">{user.username}</td>
                            <td className="p-3 border">{user.email}</td>
                            <td className="p-3 border">{user.phone}</td>
                            <td className="p-3 border">{user.createdAt}</td>
                            <td className="p-3 border">
                              <span className={`font-semibold ${
                                user.status === 'Active' ? 'text-green-600' : 'text-red-500'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="p-3 border">{user.role}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-primary/10 font-semibold">
                          <td colSpan={7} className="p-3 border">
                            Total Users: {userData.length}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* ORDER REPORT TABLE */}
            {reportType === 'orders' && orderData && (
              <>
                {orderData.orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No orders found for the selected date range
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-primary text-primary-foreground">
                          <th className="p-3 text-left border">#</th>
                          <th className="p-3 text-left border">Order No.</th>
                          <th className="p-3 text-left border">Customer</th>
                          <th className="p-3 text-left border">Date</th>
                          <th className="p-3 text-left border">Delivery Type</th>
                          <th className="p-3 text-left border">Payment</th>
                          <th className="p-3 text-left border">Status</th>
                          <th className="p-3 text-left border">Amount (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderData.orders.map((order, index) => (
                          <tr
                            key={index}
                            className={index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}
                          >
                            <td className="p-3 border">{index + 1}</td>
                            <td className="p-3 border font-mono text-xs">{order.orderNumber}</td>
                            <td className="p-3 border">{order.customerName}</td>
                            <td className="p-3 border">{order.orderDate}</td>
                            <td className="p-3 border">{order.deliveryType}</td>
                            <td className="p-3 border">
                              <span className={`font-semibold ${
                                order.paymentStatus === 'SUCCESS'
                                  ? 'text-green-600'
                                  : order.paymentStatus === 'FAILED'
                                    ? 'text-red-500'
                                    : 'text-orange-500'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="p-3 border">{order.status}</td>
                            <td className="p-3 border font-semibold">
                              Rs.{order.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-primary/10 font-semibold">
                          <td colSpan={7} className="p-3 border">
                            Total Orders: {orderData.totalOrders}
                          </td>
                          <td className="p-3 border text-green-700">
                            Revenue: Rs.{orderData.totalRevenue.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* PRODUCT REPORT TABLE */}
            {reportType === 'products' && (
              <>
                {productData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No product sales found for the selected date range
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-primary text-primary-foreground">
                          <th className="p-3 text-left border">#</th>
                          <th className="p-3 text-left border">Product Name</th>
                          <th className="p-3 text-left border">Category</th>
                          <th className="p-3 text-left border">Metal</th>
                          <th className="p-3 text-left border">Qty Sold</th>
                          <th className="p-3 text-left border">Revenue (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productData.map((product, index) => (
                          <tr
                            key={index}
                            className={index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}
                          >
                            <td className="p-3 border">{index + 1}</td>
                            <td className="p-3 border font-semibold">{product.productName}</td>
                            <td className="p-3 border">{product.category}</td>
                            <td className="p-3 border">{product.metal}</td>
                            <td className="p-3 border">{product.totalQuantitySold}</td>
                            <td className="p-3 border font-semibold">
                              Rs.{product.totalRevenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-primary/10 font-semibold">
                          <td colSpan={4} className="p-3 border">Total Products Sold</td>
                          <td className="p-3 border">
                            {productData.reduce((sum, p) => sum + p.totalQuantitySold, 0)}
                          </td>
                          <td className="p-3 border text-green-700">
                            Rs.{productData.reduce((sum, p) => sum + p.totalRevenue, 0).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Admin Signature Block — visible in preview */}
            <div className="mt-10 flex justify-end">
              <div className="text-center min-w-48">
                <div className="border-b border-gray-400 mb-2 pb-6" />
                <p className="font-semibold text-sm">Admin</p>
                <p className="text-xs text-muted-foreground">ShineCart Administrator</p>
              </div>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;