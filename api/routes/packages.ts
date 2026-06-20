import express, { type Request, type Response } from 'express';
import { getAllPackages, createPackage, updatePackage, deletePackage, reorderPackages, getPackageById } from '../store.js';
import { calculatePrice, validatePetSize } from '../calculator.js';
import type { Package, CalculationRequest } from '../types.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const packages = getAllPackages();
  res.json({
    success: true,
    data: packages,
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const pkg = getPackageById(req.params.id);
  if (!pkg) {
    return res.status(404).json({
      success: false,
      error: '套餐不存在',
    });
  }
  res.json({
    success: true,
    data: pkg,
  });
});

router.post('/', (req: Request, res: Response) => {
  const pkgData = req.body as Omit<Package, 'id' | 'createdAt'>;
  
  if (!pkgData.type || !pkgData.name || !pkgData.dailyPrice) {
    return res.status(400).json({
      success: false,
      error: '缺少必要字段',
    });
  }

  const minDays = pkgData.minDays !== undefined && pkgData.minDays !== null ? Number(pkgData.minDays) : undefined;
  const maxDays = pkgData.maxDays !== undefined && pkgData.maxDays !== null ? Number(pkgData.maxDays) : undefined;
  const discount = Number(pkgData.extendedStayDiscount) || 0;

  if (minDays !== undefined && maxDays !== undefined && minDays > maxDays) {
    return res.status(400).json({
      success: false,
      error: '最少天数不能大于最多天数',
    });
  }

  if (discount < 0 || discount > 100) {
    return res.status(400).json({
      success: false,
      error: '续住折扣必须在0到100之间',
    });
  }

  const newPkg = createPackage(pkgData);
  res.status(201).json({
    success: true,
    data: newPkg,
  });
});

router.put('/:id', (req: Request, res: Response) => {
  const updates = req.body as Partial<Package>;
  
  const minDays = updates.minDays !== undefined && updates.minDays !== null ? Number(updates.minDays) : undefined;
  const maxDays = updates.maxDays !== undefined && updates.maxDays !== null ? Number(updates.maxDays) : undefined;
  
  if (minDays !== undefined && maxDays !== undefined && minDays > maxDays) {
    return res.status(400).json({
      success: false,
      error: '最少天数不能大于最多天数',
    });
  }

  if (updates.extendedStayDiscount !== undefined) {
    const discount = Number(updates.extendedStayDiscount);
    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        error: '续住折扣必须在0到100之间',
      });
    }
  }

  const updatedPkg = updatePackage(req.params.id, updates);
  
  if (!updatedPkg) {
    return res.status(404).json({
      success: false,
      error: '套餐不存在',
    });
  }
  
  res.json({
    success: true,
    data: updatedPkg,
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = deletePackage(req.params.id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: '套餐不存在',
    });
  }
  res.json({
    success: true,
    message: '删除成功',
  });
});

router.post('/reorder', (req: Request, res: Response) => {
  const { ids } = req.body as { ids: string[] };
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({
      success: false,
      error: 'ids 参数必须是数组',
    });
  }
  reorderPackages(ids);
  res.json({
    success: true,
    data: getAllPackages(),
  });
});

router.post('/calculate', (req: Request, res: Response) => {
  const { days, petSize } = req.body as CalculationRequest;
  
  if (!days || !petSize) {
    return res.status(400).json({
      success: false,
      error: '缺少必要参数: days 和 petSize',
    });
  }

  const result = calculatePrice({ days, petSize });
  res.json(result);
});

router.post('/validate-size', (req: Request, res: Response) => {
  const { packageId, petSize } = req.body as { packageId: string; petSize: string };
  
  const pkg = getPackageById(packageId);
  if (!pkg) {
    return res.status(404).json({
      success: false,
      error: '套餐不存在',
    });
  }

  const result = validatePetSize(pkg, petSize as any);
  res.json({
    success: true,
    data: result,
  });
});

export default router;
