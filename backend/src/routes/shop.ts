import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { SHOP_CATALOG } from '../config/constants.js';
import { calculateShopDiscount } from '../utils/progression.js';

const router = Router();

// GET /api/shop/catalog
router.get('/catalog', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        attributes: true,
        inventory: true,
      },
    });

    if (!user || !user.attributes) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const discountRate = calculateShopDiscount(user.attributes.charisma);
    const ownedKeys = new Set(user.inventory.map((i: any) => i.itemKey));

    const catalogWithUserContext = SHOP_CATALOG.map((item) => {
      const discountedPrice = Math.max(0, Math.floor(item.price * (1 - discountRate)));
      const isOwned = ownedKeys.has(item.itemKey);
      const inventoryEntry = user.inventory.find((i: any) => i.itemKey === item.itemKey);

      return {
        ...item,
        originalPrice: item.price,
        discountedPrice,
        discountPercentage: Math.round(discountRate * 100),
        isOwned,
        isEquipped: inventoryEntry ? inventoryEntry.isEquipped : false,
      };
    });

    res.json({
      catalog: catalogWithUserContext,
      userGold: user.currentGold,
      streakFreezes: user.streakFreezeCount,
    });
  } catch (error: any) {
    console.error('Fetch shop catalog error:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// POST /api/shop/purchase
router.post('/purchase', requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const { itemKey } = req.body;
    const userId = req.userId!;

    const catalogItem = SHOP_CATALOG.find((item) => item.itemKey === itemKey);
    if (!catalogItem) {
      res.status(404).json({ error: 'Item not found in catalog' });
      return;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          attributes: true,
          inventory: true,
        },
      });

      if (!user || !user.attributes) {
        throw new Error('User not found');
      }

      // Check if item is already owned (for non-consumables)
      const alreadyOwned = user.inventory.find((i: any) => i.itemKey === itemKey);
      if (alreadyOwned && catalogItem.category !== 'CONSUMABLE') {
        throw new Error('You already own this item');
      }

      const discountRate = calculateShopDiscount(user.attributes.charisma);
      const finalPrice = Math.max(0, Math.floor(catalogItem.price * (1 - discountRate)));

      if (user.currentGold < finalPrice) {
        throw new Error(
          `Insufficient Gold. Cost: ${finalPrice} Gold, Available: ${user.currentGold} Gold`
        );
      }

      // Deduct gold
      let updatedUser = await tx.user.update({
        where: { id: userId },
        data: { currentGold: { decrement: finalPrice } },
        include: { attributes: true, inventory: true },
      });

      let purchasedItem: any = null;

      // Handle item delivery based on category
      if (catalogItem.itemKey === 'STREAK_FREEZE') {
        updatedUser = await tx.user.update({
          where: { id: userId },
          data: { streakFreezeCount: { increment: 1 } },
          include: { attributes: true, inventory: true },
        });
      } else if (catalogItem.itemKey === 'POTION_MIND_ELIXIR') {
        // Mind surge elixir immediately grants +75 XP
        updatedUser = await tx.user.update({
          where: { id: userId },
          data: { currentXp: { increment: 75 } },
          include: { attributes: true, inventory: true },
        });
      } else {
        // Gear, Theme, or Badge: add to inventory
        purchasedItem = await tx.inventoryItem.create({
          data: {
            userId,
            itemKey: catalogItem.itemKey,
            name: catalogItem.name,
            category: catalogItem.category,
            isEquipped: true, // Auto-equip newly acquired gear or theme
          },
        });

        // If newly purchased theme, automatically activate it
        if (catalogItem.category === 'THEME') {
          const themeName = catalogItem.itemKey.replace('THEME_', '');
          updatedUser = await tx.user.update({
            where: { id: userId },
            data: { activeTheme: themeName },
            include: { attributes: true, inventory: true },
          });
        }
      }

      // Record in audit log
      await tx.auditLog.create({
        data: {
          userId,
          actionType: 'ITEM_PURCHASED',
          goldDelta: -finalPrice,
          details: JSON.stringify({
            itemKey: catalogItem.itemKey,
            itemName: catalogItem.name,
            category: catalogItem.category,
            pricePaid: finalPrice,
          }),
        },
      });

      return {
        message: `Successfully acquired ${catalogItem.name}!`,
        user: updatedUser,
        purchasedItem,
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error('Purchase error:', error);
    res.status(400).json({ error: error.message || 'Failed to complete purchase' });
  }
});

export default router;
