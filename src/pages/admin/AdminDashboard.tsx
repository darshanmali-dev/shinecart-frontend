import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { productService } from '@/services/productService';
import type { Product } from '@/services/types';
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Upload,
  Loader2,
  X,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────
//  DROPDOWN OPTIONS
// ─────────────────────────────────────────────
const CATEGORY_OPTIONS = ['Rings', 'Necklaces', 'Bracelets', 'Earrings', 'Pendants', 'Bangles', 'Chains', 'Anklets'];
const METAL_OPTIONS = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold'];
const STONE_OPTIONS = ['None', 'Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl', 'Topaz', 'Opal', 'Amethyst', 'Garnet', 'Turquoise'];
const AVAILABILITY_OPTIONS = ['In Stock', 'Limited Stock', 'Out of Stock'];
const BADGE_OPTIONS = ['', 'Best Seller', 'New Arrival', 'Limited Edition', 'Sale', 'Trending', 'Exclusive'];

// ─────────────────────────────────────────────
//  FEATURE & SPECIFICATION ROW TYPES
// ─────────────────────────────────────────────
interface SpecRow { label: string; value: string; }

// ─────────────────────────────────────────────
//  STOCK BADGE HELPER
// ─────────────────────────────────────────────
const StockBadge = ({ qty }: { qty: number }) => {
  if (qty < 5)
    return <Badge className="bg-red-500 hover:bg-red-600 text-white">{qty} in stock</Badge>;
  if (qty <= 10)
    return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">{qty} in stock</Badge>;
  return <Badge className="bg-green-500 hover:bg-green-600 text-white">{qty} in stock</Badge>;
};

// ─────────────────────────────────────────────
//  SELECT COMPONENT (styled to match shadcn)
// ─────────────────────────────────────────────
const SelectField = ({
  id, label, value, onChange, options, required = false
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; options: string[]; required?: boolean;
}) => (
  <div>
    <Label htmlFor={id}>{label}{required && ' *'}</Label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mt-1 border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt || '— None —'}</option>
      ))}
    </select>
  </div>
);

// ─────────────────────────────────────────────
//  FEATURES EDITOR  (simple tag-like list)
// ─────────────────────────────────────────────
const FeaturesEditor = ({
  features, setFeatures
}: { features: string[]; setFeatures: (f: string[]) => void }) => {
  const [inputVal, setInputVal] = useState('');

  const addFeature = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    setFeatures([...features, trimmed]);
    setInputVal('');
  };

  const removeFeature = (i: number) =>
    setFeatures(features.filter((_, idx) => idx !== i));

  return (
    <div>
      <Label>Features</Label>
      <p className="text-xs text-muted-foreground mb-2">
        e.g. BIS Hallmarked, IGI Certified, Lifetime Exchange
      </p>

      {/* Existing features as tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {features.map((f, i) => (
          <span
            key={i}
            className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
          >
            {f}
            <button type="button" onClick={() => removeFeature(i)}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Add new feature */}
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
          placeholder="Type a feature and press Enter or +"
          className="text-sm"
        />
        <EnhancedButton type="button" variant="outline" size="sm" onClick={addFeature}>
          <PlusCircle className="h-4 w-4" />
        </EnhancedButton>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  SPECIFICATIONS EDITOR  (label-value pairs)
// ─────────────────────────────────────────────
const SpecificationsEditor = ({
  specs, setSpecs
}: { specs: SpecRow[]; setSpecs: (s: SpecRow[]) => void }) => {
  const addRow = () => setSpecs([...specs, { label: '', value: '' }]);

  const updateRow = (i: number, field: 'label' | 'value', val: string) => {
    const updated = specs.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    setSpecs(updated);
  };

  const removeRow = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));

  return (
    <div>
      <Label>Specifications</Label>
      <p className="text-xs text-muted-foreground mb-2">
        e.g. Metal Purity → 18K, Weight → 4.5g, Width → 2mm
      </p>

      <div className="space-y-2">
        {specs.map((spec, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              value={spec.label}
              onChange={(e) => updateRow(i, 'label', e.target.value)}
              placeholder="Label (e.g. Metal Purity)"
              className="text-sm flex-1"
            />
            <span className="text-muted-foreground">→</span>
            <Input
              value={spec.value}
              onChange={(e) => updateRow(i, 'value', e.target.value)}
              placeholder="Value (e.g. 18K)"
              className="text-sm flex-1"
            />
            <button type="button" onClick={() => removeRow(i)}>
              <X className="h-4 w-4 text-destructive" />
            </button>
          </div>
        ))}
      </div>

      <EnhancedButton
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={addRow}
      >
        <PlusCircle className="h-4 w-4 mr-1" />
        Add Specification
      </EnhancedButton>
    </div>
  );
};

// ─────────────────────────────────────────────
//  PRODUCT FORM DIALOG
// ─────────────────────────────────────────────
interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  imagePreviews: string[];
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  saving: boolean;
  featuresList: string[];
  setFeaturesList: (f: string[]) => void;
  specsList: SpecRow[];
  setSpecsList: (s: SpecRow[]) => void;
}

const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  isOpen, onClose, onSave, title,
  formData, setFormData,
  imagePreviews, handleImageSelect, removeImage,
  saving,
  featuresList, setFeaturesList,
  specsList, setSpecsList,
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fill in the product details below</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">

          {/* ── Basic Info ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((p: any) => ({ ...p, name: e.target.value }))}
                placeholder="Diamond Ring"
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData((p: any) => ({ ...p, sku: e.target.value }))}
                placeholder="DR-001"
              />
            </div>
          </div>

          {/* ── Price ── */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((p: any) => ({ ...p, price: e.target.value }))}
                placeholder="89999"
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price (₹)</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData((p: any) => ({ ...p, originalPrice: e.target.value }))}
                placeholder="99999"
              />
            </div>
            <div>
              <Label htmlFor="discount">Discount %</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData((p: any) => ({ ...p, discount: e.target.value }))}
                placeholder="10"
              />
            </div>
          </div>

          {/* ── Category & Metal ── DROPDOWNS */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              id="category"
              label="Category"
              required
              value={formData.category}
              onChange={(v) => setFormData((p: any) => ({ ...p, category: v }))}
              options={CATEGORY_OPTIONS}
            />
            <SelectField
              id="metal"
              label="Metal"
              required
              value={formData.metal}
              onChange={(v) => setFormData((p: any) => ({ ...p, metal: v }))}
              options={METAL_OPTIONS}
            />
          </div>

          {/* ── Stone & Badge ── DROPDOWNS */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              id="stone"
              label="Stone"
              value={formData.stone}
              onChange={(v) => setFormData((p: any) => ({ ...p, stone: v }))}
              options={STONE_OPTIONS}
            />
            <SelectField
              id="badge"
              label="Badge"
              value={formData.badge}
              onChange={(v) => setFormData((p: any) => ({ ...p, badge: v }))}
              options={BADGE_OPTIONS}
            />
          </div>

          {/* ── Availability & Stock ── */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              id="availability"
              label="Availability"
              value={formData.availability}
              onChange={(v) => setFormData((p: any) => ({ ...p, availability: v }))}
              options={AVAILABILITY_OPTIONS}
            />
            <div>
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData((p: any) => ({ ...p, stockQuantity: e.target.value }))}
                placeholder="10"
              />
              {/* Stock colour preview */}
              {formData.stockQuantity !== '' && (
                <div className="mt-1">
                  <StockBadge qty={parseInt(formData.stockQuantity) || 0} />
                </div>
              )}
            </div>
          </div>

          {/* ── Sizes ── */}
          <div>
            <Label htmlFor="sizes">Sizes (comma-separated)</Label>
            <Input
              id="sizes"
              value={formData.sizes}
              onChange={(e) => setFormData((p: any) => ({ ...p, sizes: e.target.value }))}
              placeholder="5, 6, 7, 8, 9"
            />
          </div>

          {/* ── Description ── */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((p: any) => ({ ...p, description: e.target.value }))}
              placeholder="Write a detailed product description..."
              rows={3}
            />
          </div>

          {/* ── Features ── USER-FRIENDLY TAG INPUT */}
          <FeaturesEditor features={featuresList} setFeatures={setFeaturesList} />

          {/* ── Specifications ── USER-FRIENDLY KEY-VALUE */}
          <SpecificationsEditor specs={specsList} setSpecs={setSpecsList} />

          {/* ── Images ── */}
          <div>
            <Label>Product Images</Label>
            <div className="border-2 border-dashed rounded-lg p-4 mt-1">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload images</p>
                </div>
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <EnhancedButton variant="outline" onClick={onClose} type="button">Cancel</EnhancedButton>
          <EnhancedButton onClick={onSave} disabled={saving} type="button">
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : 'Save Product'}
          </EnhancedButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────
//  ADMIN DASHBOARD
// ─────────────────────────────────────────────
const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    activeCustomers: 0,
    totalProducts: 0,
    revenue: 0,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // ── Form State ──
  const emptyForm = {
    name: '', price: '', originalPrice: '',
    category: CATEGORY_OPTIONS[0],
    metal: METAL_OPTIONS[0],
    stone: STONE_OPTIONS[0],
    discount: '', badge: '', sku: '',
    availability: 'In Stock',
    sizes: '', description: '',
    stockQuantity: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [specsList, setSpecsList] = useState<SpecRow[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => { fetchProducts(); fetchStats(); }, []);

  // ─────────────────────────────────────────────
  //  FETCH
  // ─────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProductsAdmin();
      if (response.success) setProducts(response.data);
      else toast.error('Failed to load products');
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalOrders: data.totalOrders || 0,
          activeCustomers: data.activeCustomers || 0,
          totalProducts: data.totalProducts || 0,
          revenue: data.revenue || 0,
        });
      }
    } catch { /* silent */ }
    finally { setStatsLoading(false); }
  };

  // ─────────────────────────────────────────────
  //  AVAILABILITY TOGGLE
  // ─────────────────────────────────────────────
  const handleToggleAvailability = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const response = await productService.toggleAvailability(product.id);
      if (!response.success) throw new Error(response.message);
      toast.success(`Product marked as ${response.data.availability}`);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
    } finally {
      setTogglingId(null);
    }
  };

  // ─────────────────────────────────────────────
  //  IMAGES
  // ─────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadProductImages = async (productId: number, files: File[]) => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    const res = await fetch(`${BASE_URL}/api/products/${productId}/upload-images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      body: fd,
    });
    if (!res.ok) throw new Error('Failed to upload images');
  };

  // ─────────────────────────────────────────────
  //  HELPERS - convert features/specs to JSON
  // ─────────────────────────────────────────────
  const buildFeaturesJson = () => JSON.stringify(featuresList);
  const buildSpecsJson = () => JSON.stringify(specsList.filter(s => s.label && s.value));

  const resetForm = () => {
    setFormData(emptyForm);
    setFeaturesList([]);
    setSpecsList([]);
    setImageFiles([]);
    setImagePreviews([]);
  };

  // ─────────────────────────────────────────────
  //  CREATE
  // ─────────────────────────────────────────────
  const handleCreateProduct = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.metal || !formData.sku) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price),
          category: formData.category,
          metal: formData.metal,
          stone: formData.stone === 'None' ? null : formData.stone,
          discount: parseInt(formData.discount) || 0,
          badge: formData.badge || null,
          sku: formData.sku,
          availability: formData.availability,
          sizes: formData.sizes,
          description: formData.description,
          features: buildFeaturesJson(),
          specifications: buildSpecsJson(),
          stockQuantity: parseInt(formData.stockQuantity) || 0,
        }),
      });
      if (!res.ok) throw new Error();
      const product = await res.json();
      if (imageFiles.length > 0) await uploadProductImages(product.id, imageFiles);
      toast.success('Product created successfully!');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchProducts();
      fetchStats();
    } catch { toast.error('Failed to create product'); }
    finally { setSaving(false); }
  };

  // ─────────────────────────────────────────────
  //  EDIT - open dialog pre-filled
  // ─────────────────────────────────────────────
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);

    // Parse existing features back to array
    let parsedFeatures: string[] = [];
    try { parsedFeatures = JSON.parse(product.features || '[]'); } catch { parsedFeatures = []; }

    // Parse existing specs back to SpecRow[]
    let parsedSpecs: SpecRow[] = [];
    try { parsedSpecs = JSON.parse(product.specifications || '[]'); } catch { parsedSpecs = []; }

    setFeaturesList(Array.isArray(parsedFeatures) ? parsedFeatures : []);
    setSpecsList(Array.isArray(parsedSpecs) ? parsedSpecs : []);

    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category || CATEGORY_OPTIONS[0],
      metal: product.metal || METAL_OPTIONS[0],
      stone: product.stone || STONE_OPTIONS[0],
      discount: product.discount?.toString() || '0',
      badge: product.badge || '',
      sku: product.sku || '',
      availability: product.availability || 'In Stock',
      sizes: product.sizes || '',
      description: product.description || '',
      stockQuantity: product.stockQuantity?.toString() || '0',
    });

    setImageFiles([]);
    setImagePreviews([]);
    setIsEditDialogOpen(true);
  };

  // ─────────────────────────────────────────────
  //  UPDATE
  // ─────────────────────────────────────────────
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.price),
          category: formData.category,
          metal: formData.metal,
          stone: formData.stone === 'None' ? null : formData.stone,
          discount: parseInt(formData.discount) || 0,
          badge: formData.badge || null,
          sku: formData.sku,
          availability: formData.availability,
          sizes: formData.sizes,
          description: formData.description,
          features: buildFeaturesJson(),
          specifications: buildSpecsJson(),
          stockQuantity: parseInt(formData.stockQuantity) || 0,
        }),
      });
      if (!res.ok) throw new Error();
      if (imageFiles.length > 0) await uploadProductImages(selectedProduct.id, imageFiles);
      toast.success('Product updated successfully!');
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedProduct(null);
      fetchProducts();
    } catch { toast.error('Failed to update product'); }
    finally { setSaving(false); }
  };

  // ─────────────────────────────────────────────
  //  DELETE
  // ─────────────────────────────────────────────
  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete product');
      }
      toast.success('Product deleted successfully');
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  // ─────────────────────────────────────────────
  //  STATS CARDS
  // ─────────────────────────────────────────────
  const statsCards = [
    { title: 'Total Orders',    value: statsLoading ? '...' : stats.totalOrders.toString(),                       icon: ShoppingCart, path: '/admin/orders'    },
    { title: 'Total Customers',value: statsLoading ? '...' : stats.activeCustomers.toString(),                   icon: Users,        path: '/admin/customers' },
    { title: 'Products',        value: statsLoading ? '...' : stats.totalProducts.toString(),                     icon: Package,      path: '/admin/dashboard' },
    { title: 'Order Placed Revenue',value: statsLoading ? '...' : `₹${(stats.revenue / 100000).toFixed(2)}L`,        icon: TrendingUp,   path: '/admin/orders'    },
  ];

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="font-luxury text-4xl font-bold">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <EnhancedButton onClick={() => navigate('/admin/auctions')} className="w-full sm:w-auto">
            <Gavel className="h-4 w-4 mr-2" />Manage Auctions
          </EnhancedButton>
          <EnhancedButton onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />Add Product
          </EnhancedButton>
          <EnhancedButton 
  onClick={() => navigate('/admin/reports')} 
  className="w-full sm:w-auto"
>
  <FileText className="h-4 w-4 mr-2" />
  Generate Reports
</EnhancedButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 cursor-pointer">
        {statsCards.map((stat, i) => (
          <Card key={i} onClick={() => navigate(stat.path)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    {/* Image */}
                    <TableCell>
                      {product.image ? (
                        <img
                          src={BASE_URL + product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>

                    {/* Name */}
                    <TableCell className="font-medium">{product.name}</TableCell>

                    {/* SKU */}
                    <TableCell>{product.sku}</TableCell>

                    {/* Category */}
                    <TableCell>{product.category}</TableCell>

                    {/* Price */}
                    <TableCell>₹{product.price.toLocaleString()}</TableCell>

                    {/* Stock - colour coded */}
                    <TableCell>
                      <StockBadge qty={product.stockQuantity || 0} />
                    </TableCell>

                    {/* Availability status badge */}
                    <TableCell>
                      <Badge
                        className={
                          product.availability === 'In Stock'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : product.availability === 'Limited Stock'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }
                      >
                        {product.availability || 'In Stock'}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center space-x-1">

                        {/* Toggle availability */}
                        <EnhancedButton
                          variant="ghost"
                          size="sm"
                          title={product.availability === 'Out of Stock' ? 'Mark Available' : 'Mark Unavailable'}
                          onClick={() => handleToggleAvailability(product)}
                          disabled={togglingId === product.id}
                        >
                          {togglingId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : product.availability === 'Out of Stock' ? (
                            <ToggleLeft className="h-5 w-5 text-red-500" />
                          ) : (
                            <ToggleRight className="h-5 w-5 text-green-500" />
                          )}
                        </EnhancedButton>

                        {/* Edit */}
                        <EnhancedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </EnhancedButton>

                        {/* Delete */}
                        <EnhancedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </EnhancedButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <ProductFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => { setIsCreateDialogOpen(false); resetForm(); }}
        onSave={handleCreateProduct}
        title="Create New Product"
        formData={formData}
        setFormData={setFormData}
        imagePreviews={imagePreviews}
        handleImageSelect={handleImageSelect}
        removeImage={removeImage}
        saving={saving}
        featuresList={featuresList}
        setFeaturesList={setFeaturesList}
        specsList={specsList}
        setSpecsList={setSpecsList}
      />

      {/* Edit Dialog */}
      <ProductFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => { setIsEditDialogOpen(false); resetForm(); setSelectedProduct(null); }}
        onSave={handleUpdateProduct}
        title="Edit Product"
        formData={formData}
        setFormData={setFormData}
        imagePreviews={imagePreviews}
        handleImageSelect={handleImageSelect}
        removeImage={removeImage}
        saving={saving}
        featuresList={featuresList}
        setFeaturesList={setFeaturesList}
        specsList={specsList}
        setSpecsList={setSpecsList}
      />
    </div>
  );
};

export default AdminDashboard;