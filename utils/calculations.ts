import { CartItem, Location, AppliedDiscount, Promotion, MenuItem, OrderType, AppSettings, RecipeItem, Ingredient, Customer, Surcharge } from '../types';

export const getPriceForItem = (item: MenuItem, orderType: OrderType, customer?: Customer | null): number => {
    if (customer && customer.membershipTier) {
        const memberPriceKey = `memberPrice${customer.membershipTier}` as keyof MenuItem;
        const memberPrice = item[memberPriceKey];
        if (typeof memberPrice === 'number') {
            return memberPrice;
        }
    }
    if (orderType === 'takeaway' && typeof item.takeawayPrice === 'number') {
        return item.takeawayPrice;
    }
    if (orderType === 'delivery' && typeof item.deliveryPrice === 'number') {
        return item.deliveryPrice;
    }
    return item.price; // Default to dine-in price
};

export const calculateOrderTotals = (
    cart: CartItem[],
    location: Location,
    appliedDiscount: AppliedDiscount | null,
    promotion: Promotion | null | undefined,
    orderType: OrderType = 'dine-in',
    settings: AppSettings | undefined,
    customer: Customer | null | undefined,
    surcharges: Surcharge[] = [],
    appliedLoyaltyPoints: number = 0
) => {
    const safeCart = cart || [];
    let subtotal = 0;
    const taxDetails: Record<string, number> = {};

    safeCart.forEach(item => {
        const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
        const itemBasePrice = item.priceOverride ?? getPriceForItem(item.menuItem, orderType, customer);
        const singleItemPrice = itemBasePrice + modifiersTotal;
        const lineItemTotal = singleItemPrice * item.quantity;
        subtotal += lineItemTotal;
    });
    
    let promoDiscountAmount = 0;
    let finalAppliedDiscount: AppliedDiscount | null = null;

    if (appliedDiscount) {
        promoDiscountAmount = appliedDiscount.amount;
        finalAppliedDiscount = { ...appliedDiscount };
    } else if (promotion) {
        let promotionDiscount = 0;
        const applicableItems = safeCart.filter(item => 
            item.menuItem.isDiscountable !== false &&
            (promotion.applicableCategoryIds.length === 0 || promotion.applicableCategoryIds.includes(item.menuItem.category)) &&
            (promotion.applicableProductIds.length === 0 || promotion.applicableProductIds.includes(item.menuItem.id))
        );
        
        if (promotion.type === 'percentage') {
             const applicableSubtotal = applicableItems.reduce((sum, item) => {
                const itemBasePrice = item.priceOverride ?? getPriceForItem(item.menuItem, orderType, customer);
                const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
                return sum + (itemBasePrice + modifiersTotal) * item.quantity;
            }, 0);
            promotionDiscount = applicableSubtotal * promotion.value;
        } else if (promotion.type === 'fixed') {
            promotionDiscount = promotion.value;
        } else if (promotion.type === 'bogo') {
            const sortedApplicableItems = applicableItems
                .flatMap(item => Array(item.quantity).fill(item.menuItem))
                .sort((a, b) => getPriceForItem(a, orderType, customer) - getPriceForItem(b, orderType, customer));

            const pairs = Math.floor(sortedApplicableItems.length / 2);
            for (let i = 0; i < pairs; i++) {
                promotionDiscount += getPriceForItem(sortedApplicableItems[i], orderType, customer);
            }
        }
        
        promoDiscountAmount = promotionDiscount;
        finalAppliedDiscount = { name: promotion.name, amount: promotionDiscount };
    }
    
    const discountableSubtotal = safeCart.reduce((sum, item) => {
        if (item.menuItem.isDiscountable === false) {
            return sum;
        }
        const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
        const itemBasePrice = item.priceOverride ?? getPriceForItem(item.menuItem, orderType, customer);
        const singleItemPrice = itemBasePrice + modifiersTotal;
        return sum + (singleItemPrice * item.quantity);
    }, 0);
    
    promoDiscountAmount = Math.max(0, Math.min(discountableSubtotal, promoDiscountAmount));
    if (finalAppliedDiscount) {
        finalAppliedDiscount.amount = promoDiscountAmount;
    }

    let loyaltyDiscountAmount = 0;
    if (settings && settings.loyalty.enabled && appliedLoyaltyPoints > 0) {
        const potentialDiscount = appliedLoyaltyPoints / settings.loyalty.redemptionRate;
        loyaltyDiscountAmount = Math.min(subtotal - promoDiscountAmount, potentialDiscount);
    }
    
    const totalDiscountAmount = promoDiscountAmount + loyaltyDiscountAmount;
    const discountedSubtotal = subtotal - totalDiscountAmount;

    safeCart.forEach(item => {
        const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
        const itemBasePrice = item.priceOverride ?? getPriceForItem(item.menuItem, orderType, customer);
        const singleItemPrice = itemBasePrice + modifiersTotal;
        const lineItemTotal = singleItemPrice * item.quantity;
        
        const itemIsDiscountable = item.menuItem.isDiscountable !== false;
        const itemDiscount = (itemIsDiscountable && subtotal > 0) ? (lineItemTotal / subtotal) * totalDiscountAmount : 0;
        const taxableAmount = lineItemTotal - itemDiscount;
        
        const taxCategory = item.menuItem.taxCategory || 'Standard';
        const taxRate = location.taxRates[taxCategory] || 0;

        if (taxRate > 0) {
            const taxName = `${taxCategory} Tax (${(taxRate * 100).toFixed(0)}%)`;
            const itemTax = taxableAmount * taxRate;
            taxDetails[taxName] = (taxDetails[taxName] || 0) + itemTax;
        }
    });

    let surchargeAmount = 0;
    let surchargeDetails: { name: string, amount: number } | null = null;

    if (settings) {
        if (orderType === 'dine-in' && settings.dineIn.surcharge.enabled) {
            const { name, type, value } = settings.dineIn.surcharge;
            surchargeAmount = type === 'percentage' ? discountedSubtotal * (value / 100) : value;
            surchargeDetails = { name, amount: surchargeAmount };
        } else if (orderType === 'delivery' && settings.delivery.surcharge.enabled && settings.delivery.surcharge.surchargeId) {
            const surcharge = surcharges.find(s => s.id === settings.delivery.surcharge.surchargeId);
            if (surcharge) {
                surchargeAmount = surcharge.type === 'percentage' ? discountedSubtotal * surcharge.value : surcharge.value;
                surchargeDetails = { name: surcharge.name, amount: surchargeAmount };
            }
        }
    }

    const totalTax = Object.values(taxDetails).reduce((sum, tax) => sum + tax, 0);
    let total = discountedSubtotal + totalTax + surchargeAmount;
    
    if (settings && orderType === 'dine-in' && settings.dineIn.minCharge.enabled && total < settings.dineIn.minCharge.amount) {
        total = settings.dineIn.minCharge.amount;
    }

    return {
        subtotal,
        discountAmount: promoDiscountAmount,
        loyaltyDiscountAmount,
        tax: totalTax,
        taxDetails,
        total,
        finalAppliedDiscount,
        surchargeAmount,
        surchargeDetails,
    };
};

export const calculateMenuItemCost = (menuItemId: number, ingredients: Ingredient[], recipes: Record<number, RecipeItem[]>): number => {
    const recipe = recipes[menuItemId];
    if (!recipe) return 0;
    return recipe.reduce((totalCost, recipeItem) => {
      const ingredient = ingredients.find(i => i.id === recipeItem.ingredientId);
      return totalCost + (ingredient ? ingredient.costPerUnit * recipeItem.quantity : 0);
    }, 0);
};

export const isItemOutOfStock = (
    item: MenuItem, 
    cart: CartItem[],
    ingredients: Ingredient[], 
    recipes: Record<number, RecipeItem[]>
): boolean => {
    if (!item.stopSaleAtZeroStock) return false;

    const recipe = recipes[item.id];

    if (recipe && recipe.length > 0) {
        // Recipe-based check: Can we make one more?
        // This is a comprehensive check that considers all items in the cart that use the same ingredients.
        const ingredientDemand = new Map<string, number>();
        cart.forEach(cartItem => {
            const cartItemRecipe = recipes[cartItem.menuItem.id];
            if (cartItemRecipe) {
                cartItemRecipe.forEach(recipePart => {
                    const currentDemand = ingredientDemand.get(recipePart.ingredientId) || 0;
                    ingredientDemand.set(recipePart.ingredientId, currentDemand + (recipePart.quantity * cartItem.quantity));
                });
            }
        });
        
        // Now check if adding one more of the current item is possible
        for (const recipePart of recipe) {
            const ingredient = ingredients.find(i => i.id === recipePart.ingredientId);
            if (!ingredient) return true; // Ingredient definition missing, treat as out of stock

            const currentDemandForIngredient = ingredientDemand.get(recipePart.ingredientId) || 0;
            if (ingredient.stock < currentDemandForIngredient + recipePart.quantity) {
                return true; // Not enough stock for this ingredient
            }
        }

        return false; // Enough ingredients for one more
    } else if (typeof item.stock === 'number') {
        // Direct stock check
        const cartQuantity = cart.filter(ci => ci.menuItem.id === item.id)
                                 .reduce((sum, ci) => sum + ci.quantity, 0);
        return item.stock <= cartQuantity;
    }

    return false;
};


export const generateZatcaQRCode = (order: {createdAt: number, total: number, tax: number}, location: { name: string, vatNumber?: string }): string => {
    const sellerName = location.name;
    const vatNumber = location.vatNumber || '';
    const timestamp = new Date(order.createdAt).toISOString();
    const total = order.total.toFixed(2);
    const tax = order.tax.toFixed(2);

    const encoder = new TextEncoder();

    const getTlvBytes = (tag: number, value: string): Uint8Array => {
        const valueBytes = encoder.encode(value);
        const tagAsBytes = new Uint8Array([tag]);
        const lengthAsBytes = new Uint8Array([valueBytes.length]);
        
        const tlvBytes = new Uint8Array(tagAsBytes.length + lengthAsBytes.length + valueBytes.length);
        tlvBytes.set(tagAsBytes, 0);
        tlvBytes.set(lengthAsBytes, tagAsBytes.length);
        tlvBytes.set(valueBytes, tagAsBytes.length + lengthAsBytes.length);
        
        return tlvBytes;
    };
    
    const tlvFields = [
        getTlvBytes(1, sellerName),
        getTlvBytes(2, vatNumber),
        getTlvBytes(3, timestamp),
        getTlvBytes(4, total),
        getTlvBytes(5, tax)
    ];

    const totalLength = tlvFields.reduce((sum, field) => sum + field.length, 0);
    const finalTlvBytes = new Uint8Array(totalLength);
    
    let offset = 0;
    for (const field of tlvFields) {
        finalTlvBytes.set(field, offset);
        offset += field.length;
    }

    let binaryString = '';
    for (let i = 0; i < finalTlvBytes.length; i++) {
        binaryString += String.fromCharCode(finalTlvBytes[i]);
    }
    
    return btoa(binaryString);
};