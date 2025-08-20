

import React from 'react';
import { createPortal } from 'react-dom';
import { useModalContext } from '../contexts/AppContext';

// Import all modal components
import ModifierModal from './ModifierModal';
import PizzaBuilder from './PizzaBuilder';
import BurgerBuilder from './BurgerBuilder';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';
import ReservationModal from './ReservationModal';
import CustomerSelectModal from './CustomerSelectModal';
import CustomerEditModal from './CustomerEditModal';
import WaitlistModal from './WaitlistModal';
import ProductContextMenu from './ProductContextMenu';
import CategoryEditModal from './CategoryEditModal';
import LocationEditModal from './LocationEditModal';
import PrinterEditModal from './PrinterEditModal';
import TaxRateEditModal from './TaxRateEditModal';
import UserEditModal from './UserEditModal';
import RoleEditModal from './RoleEditModal';
import IngredientEditModal from './IngredientEditModal';
import SupplierEditModal from './SupplierEditModal';
import PaymentTypeEditModal from './PaymentTypeEditModal';
import TableEditModal from './TableEditModal';
import QRCodeModal from './QRCodeModal';
import QRCodePluginInfoModal from './QRCodePluginInfoModal';
import PurchaseOrderModal from './PurchaseOrderModal';
import ActivationModal from './ActivationModal';
import LogWasteModal from './LogWasteModal';
import SubscriptionModal from './SubscriptionModal';
import ClientInvoiceModal from './ClientInvoiceModal';
import StockCountModal from './StockCountModal';
import PromotionModal from './PromotionModal';
import PromotionEditModal from './PromotionEditModal';
import TextInputModal from './TextInputModal';
import HeldOrdersModal from './HeldOrdersModal';
import ModifierGroupEditModal from './ModifierGroupEditModal';
import DiscountEditModal from './DiscountEditModal';
import SurchargeEditModal from './SurchargeEditModal';
import VoidOrderModal from './VoidOrderModal';
import ProductEditModal from './ProductEditModal';
import DiscountModal from './DiscountModal';
import PaymentTerminalSettingsModal from './PaymentTerminalSettingsModal';
import PizzaOptionEditModal from './PizzaOptionEditModal';
import LivePaymentModal from './LivePaymentModal';
import GenericDeviceEditModal from './GenericDeviceEditModal';
import KitchenDisplayEditModal from './KitchenDisplayEditModal';
import CustomerDisplayEditModal from './CustomerDisplayEditModal';
import ChooseStaffModal from './ChooseStaffModal';
import CallerIDModal from './CallerIDModal';
import AIChatModal from './AIChatModal';
import ProductBulkEditModal from './ProductBulkEditModal';
import A4Invoice from './A4Invoice';
import SignageContentEditModal from './SignageContentEditModal';
import SignagePlaylistEditModal from './SignagePlaylistEditModal';
import SignageScheduleEditModal from './SignageScheduleEditModal';
import SignageDisplayEditModal from './SignageDisplayEditModal';
import PrintServerGuideModal from './PrintServerGuideModal';
import NumberInputModal from './NumberInputModal';
import ConfirmModal from './ConfirmModal';
import DashboardCustomizeModal from './DashboardCustomizeModal';
import LoyaltyRedemptionModal from './LoyaltyRedemptionModal';
import BarcodeScannerModal from './BarcodeScannerModal';
import BurgerOptionEditModal from './BurgerOptionEditModal';

const ModalManager: React.FC = () => {
    const { modal, closeModal } = useModalContext();
    const { type, props } = modal;
    const modalRoot = document.getElementById('modal-root');

    // A simple mapping of modal types to their components
    const MODAL_COMPONENTS: { [key: string]: React.FC<any> } = {
        modifier: ModifierModal,
        pizzaBuilder: PizzaBuilder,
        burgerBuilder: BurgerBuilder,
        burgerOptionEdit: BurgerOptionEditModal,
        payment: PaymentModal,
        receipt: ReceiptModal,
        reservation: ReservationModal,
        customerSelect: CustomerSelectModal,
        customerEdit: CustomerEditModal,
        waitlist: WaitlistModal,
        productContextMenu: ProductContextMenu,
        categoryEdit: CategoryEditModal,
        locationEdit: LocationEditModal,
        printerEdit: PrinterEditModal,
        taxRateEdit: TaxRateEditModal,
        userEdit: UserEditModal,
        roleEdit: RoleEditModal,
        ingredientEdit: IngredientEditModal,
        supplierEdit: SupplierEditModal,
        paymentTypeEdit: PaymentTypeEditModal,
        tableEdit: TableEditModal,
        qrCode: QRCodeModal,
        qrInfo: QRCodePluginInfoModal,
        purchaseOrder: PurchaseOrderModal,
        activation: ActivationModal,
        logWaste: LogWasteModal,
        subscription: SubscriptionModal,
        clientInvoice: ClientInvoiceModal,
        stockCount: StockCountModal,
        promotion: PromotionModal,
        promotionEdit: PromotionEditModal,
        textInput: TextInputModal,
        heldOrders: HeldOrdersModal,
        modifierGroupEdit: ModifierGroupEditModal,
        discountEdit: DiscountEditModal,
        surchargeEdit: SurchargeEditModal,
        voidOrder: VoidOrderModal,
        productEdit: ProductEditModal,
        productBulkEdit: ProductBulkEditModal,
        A4Invoice: A4Invoice, // Retained for modal-like preview if needed, but not for printing.
        discount: DiscountModal,
        paymentTerminalSettings: PaymentTerminalSettingsModal,
        pizzaOptionEdit: PizzaOptionEditModal,
        livePayment: LivePaymentModal,
        genericDeviceEdit: GenericDeviceEditModal,
        kitchenDisplayEdit: KitchenDisplayEditModal,
        customerDisplayEdit: CustomerDisplayEditModal,
        chooseStaff: ChooseStaffModal,
        callerID: CallerIDModal,
        aiChat: AIChatModal,
        signageContentEdit: SignageContentEditModal,
        signagePlaylistEdit: SignagePlaylistEditModal,
        signageScheduleEdit: SignageScheduleEditModal,
        signageDisplayEdit: SignageDisplayEditModal,
        printServerGuide: PrintServerGuideModal,
        numberInput: NumberInputModal,
        confirm: ConfirmModal,
        dashboardCustomize: DashboardCustomizeModal,
        loyaltyRedemption: LoyaltyRedemptionModal,
        barcodeScanner: BarcodeScannerModal,
    };

    const SpecificModal = type ? MODAL_COMPONENTS[type] : null;

    if (!SpecificModal || !modalRoot) {
        return null;
    }

    return createPortal(
        <SpecificModal isOpen={!!type} onClose={closeModal} {...props} />,
        modalRoot
    );
};

export default ModalManager;