const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const walletCtrl = require('../controllers/wallet.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { uploadProductImage } = require('../middlewares/upload.middleware');

router.use(protect, requireRole('admin'));

router.get('/dashboard', ctrl.getDashboard);

// Products — specific routes MUST come before /:id
router.get('/products', ctrl.getProducts);
router.post('/products', ctrl.createProduct);
router.get('/products/export', ctrl.exportProductsCsv);
router.post('/products/import', ctrl.importProductsCsv);
router.post('/upload-image', uploadProductImage, ctrl.uploadProductImage);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);
router.post('/products/:id/variants', ctrl.createVariant);
router.put('/products/:id/variants/:variantId', ctrl.updateVariant);
router.delete('/products/:id/variants/:variantId', ctrl.deleteVariant);

// Categories
router.get('/categories', ctrl.getCategories);
router.post('/categories', ctrl.createCategory);
router.put('/categories/:id', ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

// Orders
router.get('/orders', ctrl.getOrders);
router.put('/orders/:id/status', ctrl.updateOrderStatus);

// Users
router.get('/users', ctrl.getUsers);
router.put('/users/:id/toggle', ctrl.toggleUserStatus);

// Coupons
router.get('/coupons', ctrl.getCoupons);
router.post('/coupons', ctrl.createCoupon);
router.put('/coupons/:id', ctrl.updateCoupon);

// Reviews
router.get('/reviews', ctrl.getReviews);
router.put('/reviews/:id/toggle', ctrl.toggleReviewApproval);

// Returns
router.get('/returns', ctrl.getReturnRequests);
router.put('/returns/:id', ctrl.updateReturnRequest);

// Wallet
router.post('/wallet/topup', walletCtrl.adminTopup);
router.get('/wallet/topups', ctrl.getTopupRequests);
router.put('/wallet/topups/:id/confirm', ctrl.confirmTopup);
router.get('/wallet/withdrawals', ctrl.getWithdrawalRequests);
router.put('/wallet/withdrawals/:id', ctrl.processWithdrawal);

module.exports = router;
