
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CartItem, Customer, OrderType, Employee, AppliedDiscount, Language, Table, Location, Order, AppSettings, AIResponse, AISettings, Promotion, ManualDiscount, Surcharge } from '../types';
import OrderItem from './OrderItem';
import UserCircleIcon from './icons/UserCircleIcon';
import { calculateOrderTotals } from '../utils/calculations';
import SparklesIcon from './icons/SparklesIcon';
import AISuggestions from './AISuggestions';
import { useAppContext } from '../contexts/AppContext';
import { Button } from './ui/Button';
import TrashIcon from './icons/TrashIcon';
import PauseIcon from './icons/PauseIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import ChefHatIcon from './icons/ChefHatIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import UserIcon from './icons/UserIcon';
import { useTranslations } from '../hooks/useTranslations';
import ShoppingBagIcon from './icons/ShoppingBagIcon';
import StarIcon from './icons/StarIcon';

export default function OrderSummary() {
  const { 
    settings, currentEmployee, currentLocation,
    tables, orders, customers, handleSaveCustomer, manualDiscounts, employees, surcharges,
    cart, onRemoveItem, onUpdateCartQuantity, currentTable, setCurrentTable: onSetCurrentTable, 
    selectedCustomer, setSelectedCustomer, onNewSaleClick, onVoidOrder, 
    appliedDiscount, appliedPromotion, 
    aiUpsellSuggestions, isSuggestingUpsell, handleGetUpsellSuggestions, onSelectUpsellSuggestion,
    handleHoldOrder, availablePromotions,
    activeOrderToSettle, handleInitiateSettlePayment,
    handleSendToKitchen, handleSettleBill,
    orderType, setOrderType, handleApplyManualDiscount, handleRemoveDiscount, handleApplyPromotion,
    selectedStaff, setSelectedStaff,
    activeTab, setActiveTab, handleSaveTab, handleSettleTab,
    handleInitiatePayment, appliedLoyaltyPoints, setAppliedLoyaltyPoints,
    openModal, closeModal, handleApplyDiscountToItem
  } = useAppContext();
  
  if (!settings) {
    return null; // or a loading component
  }
  
  const t = useTranslations(settings.language.staff);
  
  const isSettlingOrder = !!activeOrderToSettle;

  const selectCustomerAndLoadTab = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    const openTab = (orders || []).find((o: Order) => o.customer?.id === customer.id && o.status === 'partially-paid');
    if (openTab) {
        setActiveTab(openTab);
    } else {
        setActiveTab(null);
    }
  }, [setSelectedCustomer, orders, setActiveTab]);

  const handleSelectCustomer = useCallback((customer: Customer) => {
      selectCustomerAndLoadTab(customer);
      closeModal();
  }, [selectCustomerAndLoadTab, closeModal]);

  const handleAddNewCustomer = useCallback(() => {
      openModal('customerEdit', { 
        onSave: (customer: Customer, isNew: boolean) => {
            handleSaveCustomer(customer, isNew);
            if (isNew) {
              setSelectedCustomer(customer);
            }
            closeModal();
        },
    });
  }, [openModal, handleSaveCustomer, setSelectedCustomer, closeModal]);

  const handleChooseCustomer = () => {
      openModal('customerSelect', { 
          customers, 
          onSelectCustomer: handleSelectCustomer, 
          onAddNewCustomer: handleAddNewCustomer 
      });
  };
  
  const handleChooseStaff = useCallback(() => {
    const availableEmployees = (employees || []).filter((e: Employee) => e.locationId === currentLocation.id);
    openModal('chooseStaff', {
        employees: availableEmployees,
        onSelectStaff: setSelectedStaff,
        selectedStaffId: selectedStaff?.id,
    });
  }, [employees, currentLocation, openModal, setSelectedStaff, selectedStaff]);

  const showStaffSelection = settings.dineIn.enabled && settings.dineIn.enableStaffSelection;
  
  useEffect(() => {
    if (isSettlingOrder && activeOrderToSettle) {
      setOrderType(activeOrderToSettle.orderType);
      setAppliedLoyaltyPoints(activeOrderToSettle.appliedLoyaltyPoints || 0);
    } else if (activeTab) {
      setOrderType('tab');
    } else if (!currentTable && orderType === 'dine-in') {
      // If we are not on a table but orderType is still dine-in, reset to default.
      // This handles the case after a dine-in order is completed.
      setOrderType(settings.preferences.defaultOrderType);
    }
  }, [isSettlingOrder, currentTable, activeTab, settings.preferences.defaultOrderType, activeOrderToSettle, orderType, setOrderType, setAppliedLoyaltyPoints]);
  
  const pendingTableOrders = useMemo(() => {
    if (!currentTable) return [];
    return (orders || []).filter((o: Order) => o.tableId === currentTable.id && (['kitchen', 'served'].includes(o.status)));
  }, [orders, currentTable]);

  const sentItems = useMemo(() => {
    if (activeTab) return activeTab.cart || [];
    return pendingTableOrders.flatMap((o: Order) => o.cart || []);
  }, [pendingTableOrders, activeTab]);
  
  const allItemsForBill = isSettlingOrder && activeOrderToSettle ? (activeOrderToSettle.cart || []) : [...sentItems, ...(cart || [])];
  
  const { subtotal, tax, total, taxDetails, discountAmount, finalAppliedDiscount, surchargeAmount, surchargeDetails, loyaltyDiscountAmount } = useMemo(() => 
    calculateOrderTotals(allItemsForBill, currentLocation, appliedDiscount, appliedPromotion, orderType, settings, selectedCustomer, surcharges, appliedLoyaltyPoints),
  [allItemsForBill, currentLocation, appliedDiscount, appliedPromotion, orderType, settings, selectedCustomer, surcharges, appliedLoyaltyPoints]);
  
  const handleAddDiscountClick = () => {
      openModal('discount', { 
          discounts: manualDiscounts, 
          promotions: availablePromotions,
          onApplyDiscount: handleApplyManualDiscount,
          onApplyPromotion: handleApplyPromotion,
          onRemoveDiscount: handleRemoveDiscount,
          currentDiscount: finalAppliedDiscount
      });
  };

  const handleItemClick = (cartItem: CartItem) => {
    openModal('itemDiscount', {
      cartItem,
      discounts: manualDiscounts,
      onApply: handleApplyDiscountToItem,
    });
  };

  const handleRedeemLoyalty = () => {
    if (!selectedCustomer) return;
    openModal('loyaltyRedemption', {
      customer: selectedCustomer,
      orderTotal: subtotal - discountAmount, // Pass the current subtotal after other discounts
      onApplyPoints: setAppliedLoyaltyPoints,
    });
  };

  const availableTablesByFloor = useMemo(() => {
    const locationTables = (tables || []).filter((t: Table) => t.locationId === currentLocation.id);
    const availableTables = locationTables.filter((t: Table) => t.status === 'available');
    const locationFloors = [...new Set(availableTables.map(t => t.floor))].sort();

    const grouped: { [floor: string]: Table[] } = {};
    for (const floor of locationFloors) {
        if (typeof floor === 'string' && floor) {
          grouped[floor] = availableTables.filter((t: Table) => t.floor === floor);
        }
    }
    return grouped;
  }, [tables, currentLocation]);

  const handleTableSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tableId = e.target.value;
    const selected = (tables || []).find((t: Table) => t.id === tableId);
    if (selected) {
        onSetCurrentTable(selected);
    }
  };
  
  const { currency, ai: aiSettings, language } = settings;

  const OrderTypeButton = ({ type, label }: { type: OrderType; label: string }) => (
    <button
        onClick={() => { 
            if (type !== 'dine-in') {
                onSetCurrentTable(null);
            }
            setOrderType(type);
        }}
        disabled={isSettlingOrder}
        className={`py-1.5 rounded-md font-bold text-xs transition-colors w-full ${
            orderType === type
            ? 'bg-primary text-primary-foreground'
            : 'bg-accent text-accent-foreground hover:bg-muted'
        }`}
    >
        {label}
    </button>
  );

  const getSettlementTitle = () => {
    if (!activeOrderToSettle) return '';
    const tableForOrder = activeOrderToSettle.tableId ? tables.find((t: Table) => t.id === activeOrderToSettle.tableId) : null;
    const customerForOrder = activeOrderToSettle.customer || (activeTab ? activeTab.customer : null);
    
    let title = tableForOrder?.name || customerForOrder?.name;
    if (title) return title;
    
    // Fallback to order type for orders without specific identifiers
    if (activeOrderToSettle.orderType) {
        const typeName = activeOrderToSettle.orderType.replace('-', ' ');
        return typeName.charAt(0).toUpperCase() + typeName.slice(1);
    }
    
    return 'Order'; // Safe fallback
  };

  const renderActionButtons = () => {
    const buttonBaseClass = "w-full h-12 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105 hover:shadow-lg";
    const isCartEmpty = (cart || []).length === 0;

    if (isSettlingOrder) {
        return (
            <Button className={`${buttonBaseClass}`} onClick={handleInitiateSettlePayment} disabled={allItemsForBill.length === 0}>
                <CreditCardIcon className="w-5 h-5"/> {t('settle_payment')}
            </Button>
        );
    }

    switch (orderType) {
        case 'takeaway':
        case 'delivery':
            const needsCustomer = orderType === 'delivery' && !selectedCustomer;
            const tooltip = needsCustomer ? t('delivery_needs_customer') : '';
            return (
                <Button onClick={handleInitiatePayment} disabled={isCartEmpty || needsCustomer} title={tooltip} className={`${buttonBaseClass}`}>
                    <ShoppingBagIcon className="w-5 h-5" /> {t('place_order')}
                </Button>
            );
        case 'tab':
            const needsCustomerForTab = !selectedCustomer;
            const tabTooltip = needsCustomerForTab ? t('tab_needs_customer') : '';
            return (
                 <div className="flex gap-2">
                    <Button onClick={handleSaveTab} disabled={(isCartEmpty && !activeTab) || needsCustomerForTab} title={tabTooltip} className={`${buttonBaseClass}`} variant="outline">
                        <ClipboardDocumentListIcon className="w-5 h-5" /> {activeTab ? t('add_to_tab') : t('open_tab')}
                    </Button>
                    {activeTab && (
                        <Button onClick={handleSettleTab} disabled={needsCustomerForTab} title={tabTooltip} className={`${buttonBaseClass}`}>
                            <CreditCardIcon className="w-5 h-5" /> {t('settle_tab')}
                        </Button>
                    )}
                </div>
            );
        case 'dine-in':
        default:
            const isSendToKitchenDisabled = isCartEmpty || !currentTable;
            const isSettleBillDisabled = (sentItems.length === 0 && isCartEmpty) || !currentTable;
             return (
                <div className="flex gap-2">
                    <Button onClick={handleSendToKitchen} disabled={isSendToKitchenDisabled} className={`${buttonBaseClass} bg-orange-500 hover:bg-orange-600 text-white`}>
                        <ChefHatIcon className="w-5 h-5"/> {t('send_to_kitchen')}
                    </Button>
                    <Button onClick={handleSettleBill} disabled={isSettleBillDisabled} className={`${buttonBaseClass}`}>
                        <CreditCardIcon className="w-5 h-5" /> {t('settle_bill')}
                    </Button>
                </div>
            );
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-md flex flex-col h-full border border-border">
      <div className="p-2 border-b border-border bg-card">
        <div className="flex justify-end items-center h-8">
            <div className="flex items-center gap-0.5">
                <Button onClick={handleGetUpsellSuggestions} disabled={(cart || []).length === 0 || isSuggestingUpsell || !aiSettings.enableAIFeatures || !aiSettings.enableUpsell} size="icon" variant="ghost" title={t('ai_upsell')} className="text-muted-foreground hover:text-primary h-8 w-8"><SparklesIcon className={`w-5 h-5 ${isSuggestingUpsell ? 'animate-spin' : ''}`} /></Button>
                {settings.preferences.enableOrderHold && (
                    <Button onClick={handleHoldOrder} disabled={(cart || []).length === 0 || isSettlingOrder} size="icon" variant="ghost" title={t('hold_order')} className="text-muted-foreground hover:text-primary h-8 w-8"><PauseIcon className="w-5 h-5"/></Button>
                )}
                <Button onClick={onVoidOrder} disabled={(cart || []).length === 0 && !activeTab && !activeOrderToSettle} size="icon" variant="ghost" title={t('void_order')} className="text-muted-foreground hover:text-destructive h-8 w-8"><TrashIcon className="w-5 h-5"/></Button>
                <Button onClick={onNewSaleClick} size="icon" variant="ghost" title={t('new_sale')} className="text-muted-foreground hover:text-primary h-8 w-8"><PlusCircleIcon className="w-5 h-5"/></Button>
            </div>
        </div>
      </div>
       {settings.loyalty.enabled && selectedCustomer && (
        <div className="p-1.5 flex justify-between items-center bg-yellow-400/10 text-yellow-700">
          <div className="flex items-center gap-2">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span className="font-bold text-xs">{t('loyalty_points')}: {selectedCustomer.loyaltyPoints || 0}</span>
          </div>
          <Button onClick={handleRedeemLoyalty} variant="link" size="sm" className="p-0 h-auto text-xs" disabled={(selectedCustomer.loyaltyPoints || 0) === 0}>
            {t('redeem_points')}
          </Button>
        </div>
      )}
      <div className="p-2 space-y-2">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span>{isSettlingOrder ? `${t('settling')}: ${getSettlementTitle()}` : (currentTable ? currentTable.name : (activeTab ? `${t('on_tab')}: ${activeTab.customer?.name}` : t('new_order')))}</span>
              {(currentTable || activeTab) && !isSettlingOrder && (<Button variant="link" size="sm" className="p-0 h-auto text-sm" onClick={() => onSetCurrentTable(null)}>({t('change')})</Button>)}
          </h2>

          {!isSettlingOrder && orderType === 'dine-in' && !currentTable && (
              <div className="animate-fade-in-down">
                  <select
                      id="table-select" onChange={handleTableSelection} value=""
                      className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-foreground focus:ring-primary focus:border-primary font-semibold"
                  >
                      <option value="" disabled>{t('select_table')}</option>
                      {Object.entries(availableTablesByFloor).map(([floor, tablesInFloor]) => {
                          if (tablesInFloor.length === 0) return null;
                          return (
                              <optgroup key={floor} label={floor}>
                                  {tablesInFloor.map(table => (
                                      <option key={table.id} value={table.id}>{table.name} (seats {table.capacity})</option>
                                  ))}
                              </optgroup>
                          )
                      })}
                  </select>
              </div>
          )}
          
           {!isSettlingOrder && (
             <div className="grid grid-cols-4 gap-1.5">
                <OrderTypeButton type="dine-in" label={t('dine_in')} />
                {settings.takeAway.enabled && <OrderTypeButton type="takeaway" label={t('take_away')} />}
                {settings.delivery.enabled && <OrderTypeButton type="delivery" label={t('delivery')} />}
                {settings.tab.enabled && <OrderTypeButton type="tab" label={t('tab')} />}
            </div>
           )}
      </div>
      
       <div className="p-2 space-y-2 border-y border-border">
          <button onClick={handleChooseCustomer} className="w-full flex items-center gap-3 p-2 bg-secondary rounded-lg hover:bg-muted transition-colors">
            <UserCircleIcon className="w-8 h-8 text-primary"/>
            <div className="text-left">
              <p className="font-bold text-foreground text-sm">{selectedCustomer ? selectedCustomer.name : t('walk_in_customer')}</p>
              <p className="text-xs text-muted-foreground">{selectedCustomer ? (selectedCustomer.membershipId ? `ID: ${selectedCustomer.membershipId}` : t('guest')) : 'Tap to select a customer'}</p>
            </div>
          </button>
          {showStaffSelection && (
            <button onClick={handleChooseStaff} className="w-full flex items-center gap-3 p-2 bg-secondary rounded-lg hover:bg-muted transition-colors">
              <UserIcon className="w-8 h-8 text-primary"/>
              <div className="text-left">
                <p className="font-bold text-foreground text-sm">{selectedStaff ? selectedStaff.name : t('choose_staff')}</p>
                <p className="text-xs text-muted-foreground">{t('serving')}</p>
              </div>
            </button>
          )}
        </div>

      <div className="flex-grow overflow-y-auto p-2 space-y-1.5 bg-background">
        {allItemsForBill.length === 0 ? (
          <div className="flex-grow flex flex-col justify-center items-center text-muted-foreground p-4 h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-center font-medium">{t('your_cart_is_empty')}</p>
          </div>
        ) : (
          <>
            {(cart || []).length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1.5 pt-1.5 px-1">
                  {t('new_items')}
                </h3>
                <div className="space-y-1.5">
                  {(cart || []).map((item) => <OrderItem key={item.cartId} cartItem={item} onRemoveItem={onRemoveItem} onUpdateCartQuantity={onUpdateCartQuantity} orderType={orderType} customer={selectedCustomer} onClick={() => handleItemClick(item)} />)}
                </div>
              </div>
            )}
            {sentItems.length > 0 && !isSettlingOrder && (
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1.5 mt-2 px-1">{t('running_tab')}</h3>
                <div className="space-y-1.5 opacity-70">
                  {sentItems.map((item) => <OrderItem key={item.cartId} cartItem={item} onRemoveItem={() => {}} onUpdateCartQuantity={() => {}} orderType={orderType} customer={selectedCustomer} onClick={() => {}} />)}
                </div>
              </div>
            )}
            {isSettlingOrder && activeOrderToSettle && (
                 <div>
                    <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1.5 mt-2 px-1">{t('items_on_bill')}</h3>
                     <div className="space-y-1.5 opacity-70">
                        {(activeOrderToSettle.cart || []).map((item) => <OrderItem key={item.cartId} cartItem={item} onRemoveItem={() => {}} onUpdateCartQuantity={() => {}} orderType={orderType} customer={selectedCustomer} onClick={() => {}}/>)}
                    </div>
                </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-2 border-t border-border bg-card mt-auto space-y-2">
        <AISuggestions suggestions={aiUpsellSuggestions} isLoading={isSuggestingUpsell} onSelectSuggestion={onSelectUpsellSuggestion} language={language.staff} />
        
        <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('subtotal')}</span>
              <span className="font-medium text-foreground">{currency}{subtotal.toFixed(2)}</span>
            </div>
            {Object.entries(taxDetails).map(([name, value]) => (
              <div key={name} className="flex justify-between">
                <span className="text-muted-foreground">{name}</span>
                <span className="font-medium text-foreground">{currency}{value.toFixed(2)}</span>
              </div>
            ))}
            {surchargeAmount > 0 && surchargeDetails && (
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{surchargeDetails.name}</span>
                    <span className="font-medium text-foreground">{currency}{surchargeAmount.toFixed(2)}</span>
                </div>
            )}
            {discountAmount > 0 ? (
              <div className="flex justify-between text-primary">
                <button onClick={handleAddDiscountClick} className="text-primary hover:underline font-semibold">
                  {t('discount')} {finalAppliedDiscount ? `(${finalAppliedDiscount.name})` : ''}
                </button>
                <span className="font-medium">-{currency}{discountAmount.toFixed(2)}</span>
              </div>
            ) : (
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('discount')}</span>
                    <button onClick={handleAddDiscountClick} className="text-primary font-semibold hover:underline">
                        {t('apply_discount')}
                    </button>
                </div>
            )}
             {loyaltyDiscountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <button onClick={handleRedeemLoyalty} className="text-green-600 hover:underline font-semibold">
                  {t('loyalty_discount')}
                </button>
                <span className="font-medium">-{currency}{loyaltyDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 mt-1 border-t border-border">
                <span className="text-lg font-bold text-foreground">{t('total')}</span>
                <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{currency}{total.toFixed(2)}</span>
                    {settings.dualCurrency.enabled && (
                        <p className="text-xs text-muted-foreground font-mono">
                            ≈ {settings.dualCurrency.secondaryCurrency} {(total * settings.dualCurrency.exchangeRate).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </div>
        
        {renderActionButtons()}
      </div>
    </div>
  );
}
